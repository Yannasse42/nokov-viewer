(function (global) {
  // =====================================================================
  // 🌐 ÉTAT GLOBAL
  // =====================================================================
  // Contiendra l'objet `force` renvoyé par Python (pyData.force)
  let data = null;

  // =====================================================================
  // 🔹 API PUBLIQUE : appelée depuis Electron avec les données Python
  // =====================================================================
  function setData(pyData, label, containerId) {
    const container = document.getElementById(containerId);

    if (!pyData || !pyData.force) {
      if (container) {
        container.innerHTML = "<p style='color:#c4242c'>Aucune donnée force détectée</p>";
      }
      return;
    }

    data = pyData.force;

    console.log("FORCE META:", {
      sample_rate: data.sample_rate,
      cam_rate: data.cam_rate,
      len_Fz: data.Fz?.length
    });

    render(containerId);
  }

  // =====================================================================
  // 🔸 RENDER PRINCIPAL : construit la mise en page complète
  // =====================================================================
  function render(containerId) {
    const area = document.getElementById(containerId);
    if (!area) return;

    area.innerHTML = "";

    addTitle(area, "GROUND REACTION FORCES — CLINICAL VIEW");

    // ZONE 1 — Courbes GRF (cycle normalisé 0–100 %)
    const zone1 = document.createElement("div");
    zone1.className = "grf-row";
    area.appendChild(zone1);

    addCycleCurve(zone1, "Fz", "Vertical GRF");
    addCycleCurve(zone1, "Fy", "Antero–Posterior GRF");
    addCycleCurve(zone1, "Fx", "Medio–Lateral GRF");

    // ZONE 2 — GRF Vectors sagittal (Chart.js 2D)
    const zone2 = document.createElement("div");
    zone2.className = "grf-row full-row";
    area.appendChild(zone2);

    registerArrowPlugin();
    addGRFVectorPlot(zone2);

    // ZONE 3 — COP avec vitesse (scatter + colorbar)
    const zone3 = document.createElement("div");
    zone3.className = "grf-row full-row";
    area.appendChild(zone3);

    registerColorbarPlugin();
    addCOPPlot(zone3);
  }

  // =====================================================================
  // 🏷️ UI HELPERS
  // =====================================================================
  function addTitle(container, text) {
    const t = document.createElement("h3");
    t.innerText = text;
    t.style.textAlign = "center";
    t.style.color = "#355474";
    t.style.fontWeight = "bold";
    t.style.margin = "0 0 10px 0";
    container.appendChild(t);
  }

  function createCard(container, big = false) {
    const card = document.createElement("div");
    card.className = "grf-card";
    if (big) card.classList.add("grf-big");
    container.appendChild(card);
    return card;
  }

  function baseOptions(title, xlbl, ylbl) {
    return {
      responsive: true,
      animation: false,
      scales: {
        x: {
          title: { display: true, text: xlbl, color: "#355474" },
          grid: { color: "rgba(0,0,0,0.1)" },
        },
        y: {
          title: { display: true, text: ylbl, color: "#355474" },
          grid: { color: "rgba(0,0,0,0.1)" },
        },
      },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: title,
          color: "#355474",
          font: { weight: "bold" },
        },
      },
    };
  }

  // =====================================================================
  // 📈 Courbes GRF normalisées 0–100 % du cycle
  // =====================================================================
  // (Fx / Fy / Fz en fonction de % de phase d’appui)
  function addCycleCurve(container, key, title) {
    const side = data.plate_side;
    const cycles = data[`percent_cycle_${side}`];

    if (!cycles || !cycles.length) {
      console.warn("No cycle available for GRF plot");
      return;
    }

    // Un seul cycle importé depuis Python pour la visu clinique
    const cycle = cycles[0];
    const vec = cycle[key]; // Fx / Fy / Fz normalisé (101 points)

    const card = createCard(container);
    const canvas = document.createElement("canvas");
    card.appendChild(canvas);

    const x = Array.from({ length: 101 }, (_, i) => i); // 0 → 100 %
    const toeX = Math.round(cycle.toeoff_percent);

    new Chart(canvas, {
      type: "line",
      data: {
        labels: x,
        datasets: [
          {
            label: title,
            data: vec,
            borderColor: "#c4242c",
            borderWidth: 2,
            pointRadius: 0
          },
          {
            // Ligne verticale Toe-Off
            label: "TO",
            data: Array(101).fill(null).map((_, i) =>
              (i === toeX ? Math.max(...vec) : null)
            ),
            borderColor: "#355474",
            borderWidth: 2,
            borderDash: [4, 4],
            pointRadius: 0
          }
        ],
      },
      options: baseOptions(title, "% Stance Phase", `${title} (N)`),
    });
  }

  // =====================================================================
  // 🧭 GRF VECTORS (vue sagittale 2D avec Chart.js)
  // =====================================================================

  function registerArrowPlugin() {
    const arrowPlugin = {
      id: 'arrowPlugin',
      afterDatasetsDraw(chart) {
        const ctx = chart.ctx;
        chart.data.datasets.forEach((dataset, i) => {
          if (!dataset._arrow) return;
          const meta = chart.getDatasetMeta(i);
          meta.data.forEach((point, index) => {
            if (index < 1) return; // flèche seulement sur le dernier segment

            const prev = meta.data[index - 1];
            const x0 = prev.x;
            const y0 = prev.y;
            const x1 = point.x;
            const y1 = point.y;

            const dx = x1 - x0;
            const dy = y1 - y0;
            const angle = Math.atan2(dy, dx);

            const size = dataset._arrow.size || 10;
            const color = dataset._arrow.color || dataset.borderColor;

            ctx.save();
            ctx.translate(x1, y1);
            ctx.rotate(angle);

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-size, size / 2);
            ctx.lineTo(-size, -size / 2);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();

            ctx.restore();
          });
        });
      }
    };

    Chart.register(arrowPlugin);
  }

  function addGRFVectorPlot(container) {
    const card = createCard(container, true);
    const canvas = document.createElement("canvas");
    card.appendChild(canvas);
  
    const Fy = data.Fy;
    const Fz = data.Fz;
    const COPy = data.COPy;
    const sampleRate = data.sample_rate || 100;
  
    const stanceIdx = [];
    for (let i = 0; i < Fz.length; i++) {
      if (Fz[i] > 16.5) stanceIdx.push(i);
    }
    if (!stanceIdx.length) return;
  
    const first = stanceIdx[0];
    const last = stanceIdx[stanceIdx.length - 1];
    const dCoP = COPy[last] - COPy[first];
  
    const isNormal = dCoP > 0;
    console.log(isNormal ? "→ Sens normal (pas inversé)" : "↩️ Sens inversé Auto");
  
    const redFactor = Math.max(1, Math.round(sampleRate / 50));
    const datasets = [];
  
    for (let j = 0; j < stanceIdx.length; j += redFactor) {
      const i = stanceIdx[j];
  
      const cop = COPy[i] - 250;
      const fy = Fy[i];
      const fz = Fz[i];
      const scale = 0.2;
  
      const x0 = isNormal ? cop : -cop;
      const x1 = isNormal ? cop + fy * scale : -cop - fy * scale;
      const y0 = 0;
      const y1 = fz;
  
      datasets.push({
        type: "line",
        data: [
          { x: x0, y: y0 },
          { x: x1, y: y1 }
        ],
        borderColor: "#355474",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0,
        _arrow: { size: 12, color: "#355474" }
      });
    }
  
    const minCOP = Math.min(...COPy) - 250;
    const maxCOP = Math.max(...COPy) - 250;
  
    const xMin = isNormal ? minCOP - 50 : -maxCOP - 100;
    const xMax = isNormal ? maxCOP + 100 : -minCOP + 50;
  
    new Chart(canvas, {
      type: "scatter",
      data: { datasets },
      options: {
        ...baseOptions(
          "GRF Vector Plot — Sagittal Plane",
          "COP Progression (mm)",
          "Vertical Force (N)"
        ),
        plugins: { legend: { display: false } },
        scales: {
          x: {
            min: xMin,
            max: xMax
          },
          y: {
            min: 0,
            max: Math.max(...Fz) + 100
          }
        }
      }
    });
  }
  
  // =====================================================================
  // 🎥 GRF VECTORS 3D (Three.js)
  // =====================================================================

  function addGRFVectorPlot3D(containerId, mode = "grf") {
    const container = document.getElementById(containerId);
    if (!container || !data) return;

    const Fx_raw = [...data.Fx];
    const Fy_raw = [...data.Fy];
    const Fz = data.Fz;
    const COPx_raw = [...data.COPx];
    const COPy_raw = [...data.COPy];

    // 🔹 Indices en appui
    const stanceIdx = Fx_raw.map((_, i) => i).filter(i => Fz[i] > 20);
    if (!stanceIdx.length) return;

    // 🔹 Détection sens marche (variation CoP AP)
    const first = stanceIdx[0];
    const last = stanceIdx[stanceIdx.length - 1];
    const dCoP = COPy_raw[last] - COPy_raw[first];

    let Fx = Fx_raw, Fy = Fy_raw, COPx = COPx_raw, COPy = COPy_raw;
    
    if (dCoP < 0) {
      console.warn("↩️ Auto-flip 3D : marche vers arrière détectée");
      Fx  = Fx.map(v => -v);
      Fy  = Fy.map(v => -v);
    }

    // Convertit CoP en coordonnées centrées plateforme avec gestion flip
    function copToPlatform(i) {
      let x = COPx[i];
      let y = COPy[i];

      if (dCoP < 0) {
        x = 500 - x;
        y = 500 - y;
      }

      return {
        x: (x - 250) * mmToM,
        y: (y - 250) * mmToM
      };
    }


  

    const mmToM = 0.001;
    const NtoM  = 0.0001;

    // 🔹 Dimensions du conteneur → FIX width error
    const width  = container.clientWidth  || 600;
    const height = container.clientHeight || 400;

    // ----- SCÈNE + CAMERA -----
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf4f5f7);


    const camera = new THREE.PerspectiveCamera(55, width / height, 0.01, 10);
    camera.position.set(0, -0.65, 0.42);
    camera.lookAt(0, 0, 0.02);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // ----- INTERACTIONS (zoom + rotation autour de Z) -----
    let zoom = camera.position.length();
    let isDragging = false;
    let lastX = 0;

    renderer.domElement.addEventListener("wheel", (e) => {
      e.preventDefault();
      zoom += e.deltaY * 0.0007;
      zoom = Math.max(0.35, Math.min(zoom, 0.85));
      camera.position.setLength(zoom);
    });

    renderer.domElement.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return; // clic gauche uniquement
      isDragging = true;
      lastX = e.clientX;
    });

    renderer.domElement.addEventListener("mouseup", () => {
      isDragging = false;
    });

    renderer.domElement.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      scene.rotation.z -= dx * 0.005; // rotation pure sur Z
    });

    // ----- PLATEFORME -----
    const plate = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.5, 0.0001),
      new THREE.MeshStandardMaterial({ color: 0x1f1f1f })
    );
    plate.position.set(0, 0, -0.00005);


    scene.add(plate);

    // ----- LUMIÈRE -----
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0.8, -1, 1.2);
    scene.add(light);

    // ----- TRAJECTOIRE COP -----
    const copPoints = stanceIdx.map(i => {
      const p = copToPlatform(i);
      return new THREE.Vector3(p.x, p.y, 0);
    });

    const copLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(copPoints),
      new THREE.LineBasicMaterial({ color: 0xdf3030 })
    );
    scene.add(copLine);

    // ----- FLÈCHES GRF 3D (HQ) -----
    // ----- FLÈCHES GRF 3D — Ultra nettes & pointe courte -----
    const arrowColor = new THREE.Color("#0c7dee");

    // Anti-aliasing super propre
    renderer.setPixelRatio(window.devicePixelRatio || 2.0);
    renderer.antialias = true;

    // Option MSAA hardware (WebGL2)
    if (renderer.capabilities.isWebGL2) {
      renderer.getContext().enable(renderer.getContext().SAMPLE_ALPHA_TO_COVERAGE);
    }

    const maxArrows = 100;
    const step = Math.max(1, Math.floor(stanceIdx.length / maxArrows));
    const lengthScale = 3.0;

    // Épaisseur du cylindre
    const arrowThickness = 0.0012; // un poil plus visible mais ultra fin

    // Matériau brillant et lissé
    const arrowMaterial = new THREE.MeshPhongMaterial({
      color: arrowColor,
      shininess: 150,
      flatShading: false
    });

    const arrows = [];

    stanceIdx.forEach((idx, k) => {
      if (k % step !== 0) return;

      const p0 = copToPlatform(idx);
      const x0 = p0.x;
      const y0 = p0.y;


      const dx = Fx[idx] * NtoM;
      const dy = Fy[idx] * NtoM;
      const dz = Fz[idx] * NtoM;

      const dir = new THREE.Vector3(dx, dy, dz).normalize();
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz) * lengthScale;

      const cylinderHeight = len * 0.95; // <<< Beaucoup + de shaft
      const coneHeight = len * 0.05; // <<< Pointe très courte

      // Corps cylindrique
      const shaftGeometry = new THREE.CylinderGeometry(
        arrowThickness, arrowThickness, cylinderHeight, 28, 1, true
      );
      const shaft = new THREE.Mesh(shaftGeometry, arrowMaterial);

      shaft.position.set(x0, y0, 0);
      shaft.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      shaft.position.addScaledVector(dir, cylinderHeight / 2);

      // Pointe
      const headGeometry = new THREE.ConeGeometry(
        arrowThickness * 2.0, coneHeight, 32
      );
      const head = new THREE.Mesh(headGeometry, arrowMaterial);

      head.position.copy(shaft.position);
      head.position.addScaledVector(dir, cylinderHeight / 2);
      head.quaternion.copy(shaft.quaternion);

      scene.add(shaft);
      scene.add(head);

      arrows.push(shaft, head);
    });


    // ----- MARQUEUR CoP -----
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.006, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xff4444 })
    );
    scene.add(marker);

    // Initialement : si mode "grf" → flèches révélées progressivement
    arrows.forEach(a => (a.visible = (mode !== "grf")));

    // ----- ANIMATION -----
    let f = 0;

    function animate() {
      requestAnimationFrame(animate);

      const i = stanceIdx[f];

      if (mode === "cop") {
        // Mode CoP : point rouge qui se déplace, toutes flèches visibles
        marker.visible = true;
        const p = copToPlatform(i);
        marker.position.set(p.x, p.y, 0.005);

        arrows.forEach(a => (a.visible = true));

      } else if (mode === "grf") {
        // Mode GRF : CoP masqué, flèches révélées progressivement
        marker.visible = false;
        arrows.forEach((a, idx) => {
          a.visible = (idx <= f);
        });
      }

      f = (f + 1) % arrows.length;
      renderer.render(scene, camera);
    }

    animate();
  }

  // =====================================================================
  // 🦶 CoP Plot + vitesse (2D scatter couleur)
  // =====================================================================

  function getSpeedNormalized(speedArr) {
    const valid = speedArr.filter(v => v > 0);
    if (!valid.length) return speedArr.map(() => 0);

    const min = Math.min(...valid);
    const max = Math.max(...valid);

    return speedArr.map(v =>
      v <= 0 ? 0 : (v - min) / (max - min)
    );
  }

  function speedToColor(t) {
    const r = Math.round(53 + 200 * t);
    const g = 56;
    const b = Math.round(116 + 100 * (1 - t));
    return `rgb(${r},${g},${b})`;
  }

  function addCOPPlot(container) {
    if (!data) return;

    const { COPx, COPy, Fz, speed } = data;
    if (!COPx || !COPy || !Fz) {
      console.error("❌ Données CoP manquantes");
      return;
    }

    const threshold = 20;
    const pts = [];
    const colors = [];

    const hasSpeed = Array.isArray(speed);
    const speedNorm = hasSpeed ? getSpeedNormalized(speed) : [];

    const PLATE_HALF = 250; // mm → plate ±250

    // Réduction du nombre de points pour lisibilité
    const reduceFactor = Math.max(1, Math.round((data.sample_rate || 1000) / 300));

    for (let i = 0; i < COPx.length; i++) {

      if (Fz[i] < threshold) continue;
      if (i % reduceFactor !== 0) continue;

      const cx = COPx[i] - PLATE_HALF;
      const cy = COPy[i] - PLATE_HALF;

      // X = ML, Y = AP (haut = avant)
      pts.push({ x: -cx, y: -cy });

      colors.push(hasSpeed ? speedToColor(speedNorm[i]) : "black");
    }

    if (!pts.length) {
      console.warn("⚠️ Aucun CoP valide détecté (pas de contact)");
      return;
    }

    const card = createCard(container, true);
    const canvas = document.createElement("canvas");
    card.appendChild(canvas);

    const half = PLATE_HALF;

    new Chart(canvas, {
      type: "scatter",
      data: {
        datasets: [{
          data: pts,
          pointRadius: 2,
          pointBackgroundColor: colors,
          borderWidth: 0
        }]
      },
      options: {
        ...baseOptions(
          "CoP – mis à l’échelle de la plateforme",
          "CoP X (mm)",
          "CoP Y (mm)"
        ),
        aspectRatio: 1,
        scales: {
          x: { min: -half, max: half },
          y: { min: -half, max: half }
        }
      }
    });
  }

  // =====================================================================
  // 🎨 Plugin Colorbar (légende de la vitesse du CoP)
  // =====================================================================

  function registerColorbarPlugin() {
    const colorbarPlugin = {
      id: "colorbar",
      afterDraw(chart) {
        if (!chart.chartArea) return;
        if (!data || !data.speed) return;

        const speedArr = data.speed;
        const { ctx, chartArea: { top, bottom, right } } = chart;

        console.log("⚡ SPEED Stats", {
          min: Math.min(...speedArr),
          max: Math.max(...speedArr),
          mean: speedArr.reduce((a, b) => a + b) / speedArr.length
        });

        const width = 12;
        const height = bottom - top;
        const x = right + 25;
        const steps = 80;

        for (let i = 0; i < steps; i++) {
          ctx.fillStyle = speedToColor(i / (steps - 1));
          ctx.fillRect(
            x,
            bottom - height * (i / (steps - 1)),
            width,
            height / steps
          );
        }

        ctx.fillStyle = "#355474";
        ctx.textBaseline = "middle";
        ctx.font = "11px Arial";
        ctx.fillText("Speed", x - 5, top - 8);
        ctx.fillText("Low",   x + 18, bottom);
        ctx.fillText("High",  x + 18, top + 10);
      }
    };

    Chart.register(colorbarPlugin);
  }


function _plotCycleCurveCompare(container, key, title, py1, py2) {
    const side1 = py1.force.plate_side;
    const side2 = py2.force.plate_side;

    const cycle1 = py1.force[`percent_cycle_${side1}`]?.[0]?.[key];
    const cycle2 = py2.force[`percent_cycle_${side2}`]?.[0]?.[key];

    if (!cycle1 || !cycle2) return;

    const x = Array.from({ length: 101 }, (_, i) => i);

    const card = createCard(container);
    const canvas = document.createElement("canvas");
    card.appendChild(canvas);

    new Chart(canvas, {
        type: "line",
        data: {
            labels: x,
            datasets: [
                {
                    label: "Essai 1",
                    data: cycle1,
                    borderColor: "#e63946",
                    pointRadius: 0,
                    borderWidth: 2
                },
                {
                    label: "Essai 2",
                    data: cycle2,
                    borderColor: "#355474",
                    pointRadius: 0,
                    borderWidth: 2
                }
            ]
        },
        options: {
            ...baseOptions(title, "% stance phase", `${title} (N)`),
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        boxWidth: 14,
                        padding: 12,
                        color: "#222"
                    }
                }
            }
        }
    });
}

function _plotCOPCompare(container, py1, py2) {
    const card = createCard(container, true);
    const canvas = document.createElement("canvas");
    card.appendChild(canvas);

    const pts1 = _extractCOP(py1.force).map(p => ({ x:p.x, y:p.y }));
    const pts2 = _extractCOP(py2.force).map(p => ({ x:p.x, y:p.y }));

    new Chart(canvas, {
        type: "scatter",
        data: {
            datasets: [
                {
                    label: "Essai 1",
                    data: pts1,
                    pointRadius: 2,
                    backgroundColor: "#e63946"
                },
                {
                    label: "Essai 2",
                    data: pts2,
                    pointRadius: 2,
                    backgroundColor: "#355474"
                }
            ]
        },
        options: {
            ...baseOptions("CoP Comparison", "ML (mm)", "AP (mm)"),
            aspectRatio: 1,
            scales: {
                x: { min: -250, max: 250 },
                y: { min: -250, max: 250 }
            },
            plugins: {
                legend: {
                    display: true,
                    position: "top",
                    labels: {
                        padding: 10,
                        boxWidth: 14
                    }
                }
            }
        }
    });
}


  function _extractCOP(force) {
      const pts = [];
      const { COPx, COPy, Fz } = force;
      for (let i = 0; i < Fz.length; i++) {
          if (Fz[i] < 20) continue;
          pts.push({ x: COPx[i] - 250, y: COPy[i] - 250 });
      }
      return pts;
  }

  // --- 3D ---
  function _plot3DCompare(py1, py2, containerId) {
      // 👉 Réutiliser addGRFVectorPlot3D mais avec couleurs Essai1/Essai2
      Kinetics.addGRFVectorPlot3D(containerId, "grf"); // TODO: étendre à 2 essais
  }

  // =====================================================================
  // 🌍 EXPORT — Interface accessible depuis le reste de l’app
  // =====================================================================

  global.KineticsCompare = {
    render2D(py1, py2, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = ""; // clean

        _plotCycleCurveCompare(container, "Fz", "Vertical GRF", py1, py2);
        _plotCycleCurveCompare(container, "Fy", "AP GRF", py1, py2);
        _plotCycleCurveCompare(container, "Fx", "ML GRF", py1, py2);
        _plotCOPCompare(container, py1, py2);
    },

    render3D(py1, py2, containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;
  
      container.innerHTML = ""; // reset
  
      // Création des 2 zones 3D côte à côte
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.gap = "20px";
      row.style.width = "100%";
      container.appendChild(row);
  
      const cont1 = document.createElement("div");
      cont1.id = containerId + "-essai1";
      cont1.className = "grf-card grf-big";
      cont1.style.flex = "1";
      row.appendChild(cont1);

      // --- Carte Essai 2
      const cont2 = document.createElement("div");
      cont2.id = containerId + "-essai2";
      cont2.className = "grf-card grf-big";
      cont2.style.flex = "1";
      row.appendChild(cont2);

  
      // Affichage 3D Essai 1 (rouge)
      const dataBackup = data;
      data = py1.force;
      Kinetics.addGRFVectorPlot3D(cont1.id, "grf");
      data = dataBackup;
  
      // Affichage 3D Essai 2 (bleu)
      data = py2.force;
      Kinetics.addGRFVectorPlot3D(cont2.id, "grf");
      data = dataBackup;
  }
  
  };


  global.Kinetics = {
    setData,             // injection des données Python -> Vue complète
    addGRFVectorPlot3D,  // vue 3D GRF (containerId, mode="grf"/"cop")
    addCOPPlot           // possibilité d’appeler le CoP plot seul
  };

})(window);
