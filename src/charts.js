// src/charts.js
(function (global) {

  // ==============================================================
  //  🔹 État interne des options d’affichage
  // ==============================================================

  let currentPlane = "sagittal";  // Plan visualisé : sagittal, frontal, transverse
  let viewMode = "compact";       // compact = 6 graphes / detailed = 12 graphes

  // Contiendra les données Python
  let pyLeft = null;
  let pyRight = null;

  // Étiquettes affichées dans les légendes
  let labelLeft = "Essai 1";
  let labelRight = "Essai 2";

  // ==============================================================
  //  🔹 Palette couleur utilisée pour tracer les courbes
  // ==============================================================

  const COLORS = {
    red1: "rgba(180, 0, 0, 1)", red1_fill: "rgba(180, 0, 0, 0.25)",
    red2: "rgba(255, 80, 80, 1)", red2_fill: "rgba(255, 80, 80, 0.25)",
    green1: "rgba(0, 140, 0, 1)", green1_fill: "rgba(0, 140, 0, 0.25)",
    green2: "rgba(120, 220, 120, 1)", green2_fill: "rgba(120, 220, 120, 0.25)",

    // ---- Toe-Off ----
    L1: "rgb(255, 0, 0)",
    L2: "rgb(255, 120, 120)",
    R1: "rgb(0, 180, 0)",
    R2: "rgb(120, 230, 120)"
  };

  // ==============================================================
  //  🔹 API publique accessible via window.Charts
  // ==============================================================

  /**
   * Modifie le plan courant (sagittal/frontal/transverse)
   * et redessine si des données sont chargées.
   */
  function setPlane(plane, containerId) {
    currentPlane = plane;
    if (!pyLeft) return;
    if (containerId) renderGaitCharts(containerId);
  }

  /**
   * Change le mode d'affichage : compact ou detailed
   */
  function setViewMode(mode, containerId) {
    viewMode = mode;
    if (!pyLeft) return;
    if (containerId) renderGaitCharts(containerId);
  }

  function getViewMode() { return viewMode; }
  function getCurrentPlane() { return currentPlane; }

  /**
   * Charge les données provenant du backend Python
   * et déclenche l'affichage des graphes.
   */
  function setData(py1, py2, lbl1, lbl2, containerId) {
    pyLeft = py1;
    pyRight = py2 || null;
    labelLeft = lbl1 || "Essai 1";
    labelRight = lbl2 || "Essai 2";
    if (containerId) renderGaitCharts(containerId);
  }

  /**
   * Point d'entrée principal pour redessiner selon l'état actuel.
   * Gère le nombre de graphes selon vue + nombre d’essais.
   */
  function renderGaitCharts(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = ""; // supprime les graphes existants

    if (!pyRight) {
      renderSimple(pyLeft, container, labelLeft);
      return;
    }

    if (viewMode === "compact")
      renderCompact(pyLeft, pyRight, container, labelLeft, labelRight);
    else
      renderDetailed(pyLeft, pyRight, container, labelLeft, labelRight);
  }


  // =========================================================================
  // 🔸 Utilitaires Chart.js
  // =========================================================================

  /**
   * Ajoute une zone normative (moyenne ± écart-type) si disponible.
   */
  function addNormativeBand(datasets, pyData, joint, plane) {
    const norm = pyData.normative_curves?.[joint]?.[plane];
    if (!norm) return;

    const normMean = norm.mean;
    const normUpper = normMean.map((v, i) => v + norm.std[i]);
    const normLower = normMean.map((v, i) => v - norm.std[i]);

    // → Le premier dataset est invisible : base du remplissage
    datasets.push({
      label: "Norm",
      data: normLower,
      borderColor: "transparent",
      backgroundColor: "transparent",
      pointRadius: 0,
      fill: false
    });

    // → Le second dataset définit la zone visible
    datasets.push({
      label: t("charts.normative"),
      data: normUpper,
      borderColor: "transparent",
      backgroundColor: "rgba(80,80,80,0.25)",
      fill: "-1",
      pointRadius: 0
    });
  }

  /**
   * Configuration visuelle standard des graphes (labels dynamiques + traduction)
   */
  function chartOptions(joint, side) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: t("axes.x_cycle") } },
        y: { title: { display: true, text: t("axes.y_angle") } }
      },
      plugins: {
        legend: {
          labels: {
            filter: (item) => {
              const txt = item.text.toLowerCase();
              if (txt.trim() === "") return false;     // ⛔ masque les labels vides (Toe-Off)
              if (txt === "norm") return false;
              if (txt.includes("lower")) return false;
              return true;
            }            
          }
        },
        title: {
          display: true,
          text: `${t("joint." + joint)} ${t("side." + side)} — ${t("planes." + currentPlane)}`
        }
      }
    };
  }


  // =========================================================================
  // 🔹 MODE 1 ESSAI (6 graphes) — Gauche + Droite
  // =========================================================================

  function renderSimple(py1, container, label1) {
    const joints = ["Hip", "Knee", "Ankle"];
    const sides = ["L", "R"];
    const x = [...Array(101).keys()];

    for (const joint of joints) {
      for (const side of sides) {
        const meanSet = side === "L" ? py1.planes_L : py1.planes_R;
        const stdSet  = side === "L" ? py1.planes_std_L : py1.planes_std_R;
        if (!meanSet?.[joint] || !stdSet?.[joint]) continue;

        const mean = meanSet[joint][currentPlane];
        const std  = stdSet[joint][currentPlane];
        if (!mean || !std) continue;

        createChart(container, joint, side, label1, mean, std, null, null, py1);
      }
    }
  }

  // =========================================================================
  // 🔹 MODE COMPARATIF COMPACT (6 graphes)
  // =========================================================================

  function renderCompact(py1, py2, container, label1, label2) {
    const joints = ["Hip", "Knee", "Ankle"];
    const sides = ["L", "R"];

    for (const joint of joints) {
      for (const side of sides) {
        createCombinedChart(container, joint, side, py1, py2, label1, label2);
      }
    }
  }

  // =========================================================================
  // 🔹 MODE COMPARATIF DÉTAILLÉ (12 graphes)
  // =========================================================================

  function renderDetailed(py1, py2, container, label1, label2) {
    const joints = ["Hip", "Knee", "Ankle"];
    const sides = ["L", "R"];

    for (const dataObj of [
      { py: py1, label: label1, color: [COLORS.red1, COLORS.green1], fill: [COLORS.red1_fill, COLORS.green1_fill] },
      { py: py2, label: label2, color: [COLORS.red2, COLORS.green2], fill: [COLORS.red2_fill, COLORS.green2_fill] }
    ]) {
      for (const joint of joints) {
        for (const side of sides) {
          const meanSet = side === "L" ? dataObj.py.planes_L : dataObj.py.planes_R;
          const stdSet  = side === "L" ? dataObj.py.planes_std_L : dataObj.py.planes_std_R;
          if (!meanSet?.[joint] || !stdSet?.[joint]) continue;

          const m = meanSet[joint][currentPlane];
          const s = stdSet[joint][currentPlane];
          if (!m || !s) continue;

          createChart(
            container,
            joint,
            side,
            dataObj.label,
            m,
            s,
            dataObj.color,
            dataObj.fill,
            dataObj.py
          );
        }
      }
    }
  }

  function addToeOffMarkers(datasets, pyData, side, trialIndex) {
    const stats = pyData?.toeoff_meanstd?.[side === "L" ? "Left" : "Right"];
    if (!stats || stats.mean == null) return;
  
    const xIndex = Math.round(Math.min(100, Math.max(0, stats.mean)));
  
    const color =
      side === "L"
        ? (trialIndex === 1 ? COLORS.L2 : COLORS.L1)
        : (trialIndex === 1 ? COLORS.R2 : COLORS.R1);
  
    datasets.push({
      label: "",
      toeOff: { xIndex, color },
      hidden: true,        // ne participe pas au layout
      pointRadius: 0,
      borderWidth: 0,
      showLine: false,
      legend: { display: false } // 🔥 masque toute légende associée
    });
        
  }
  
  
  

  // =========================================================================
  //  🔸 Fonctions généralisées de création des graphes
  // =========================================================================

  /** Création générique d'un graphique pour 1 Dataset */
  function createChart(container, joint, side, label, mean, std, colors, fills, py) {
    const card = document.createElement("div");
    card.className = "chart-card";
    const canvas = document.createElement("canvas");
    card.appendChild(canvas);
    container.appendChild(card);

    const datasets = [];
    addNormativeBand(datasets, py, joint, currentPlane);
    addToeOffMarkers(datasets, py, side);

    const x = [...Array(101).keys()];
    const isLeft = side === "L";
    const lineColor = colors ? (isLeft ? colors[0] : colors[1]) : (isLeft ? COLORS.red1 : COLORS.green1);
    const fillColor = fills ? (isLeft ? fills[0] : fills[1]) : (isLeft ? COLORS.red1_fill : COLORS.green1_fill);

    datasets.push({
      label,
      data: mean,
      borderColor: lineColor,
      borderWidth: 3,
      tension: 0.35,
      pointRadius: 0
    });

    // Bande inférieure = mean - SD
    datasets.push({
      label: "",
      data: mean.map((v,i)=>v - std[i]),
      borderColor: "transparent",
      backgroundColor: fillColor,
      fill: "+1",
      pointRadius: 0
    });

    // Bande supérieure = mean + SD (Légende pour les ±SD)
    datasets.push({
      label: `${label} ± SD`,
      data: mean.map((v,i)=>v + std[i]),
      borderColor: "transparent",
      backgroundColor: fillColor,
      fill: "-1",
      pointRadius: 0
    });


    new Chart(canvas, {
      type: "line",
      data: { labels: x, datasets },
      options: chartOptions(joint, side)
    });
  }

  /** Création d'un graphique pour COMPARE 2 essais */
  function createCombinedChart(container, joint, side, py1, py2, label1, label2) {
    const mean1 = (side === "L" ? py1.planes_L : py1.planes_R)?.[joint]?.[currentPlane];
    const std1  = (side === "L" ? py1.planes_std_L : py1.planes_std_R)?.[joint]?.[currentPlane];
    const mean2 = (side === "L" ? py2.planes_L : py2.planes_R)?.[joint]?.[currentPlane];
    const std2  = (side === "L" ? py2.planes_std_L : py2.planes_std_R)?.[joint]?.[currentPlane];
    if (!mean1 || !std1 || !mean2 || !std2) return;

    const card = document.createElement("div");
    card.className = "chart-card";
    const canvas = document.createElement("canvas");
    card.appendChild(canvas);
    container.appendChild(card);

    const datasets = [];
    addNormativeBand(datasets, py1, joint, currentPlane);
    addToeOffMarkers(datasets, py1, side);
    addToeOffMarkers(datasets, py2, side);

    const x = [...Array(101).keys()];
    const isLeft = (side === "L");

    const c1 = isLeft ? COLORS.red1 : COLORS.green1;
    const f1 = isLeft ? COLORS.red1_fill : COLORS.green1_fill;
    const c2 = isLeft ? COLORS.red2 : COLORS.green2;
    const f2 = isLeft ? COLORS.red2_fill : COLORS.green2_fill;

    // PY1 Bande + Moyenne
    datasets.push({
      label: "",
      data: mean1.map((v, i) => v - std1[i]),
      backgroundColor: f1,
      borderColor: "transparent", // ⛔ aucun contour
      borderWidth: 0,
      fill: "+1",
      pointRadius: 0
    });
    datasets.push({
      label: `${label1} ± SD`,
      data: mean1.map((v, i) => v + std1[i]),
      backgroundColor: f1,
      borderColor: "transparent", // ⛔ aucun contour
      borderWidth: 0,
      fill: "-1",
      pointRadius: 0
    });
    datasets.push({
      label: label1,
      data: mean1,
      borderColor: c1,
      borderWidth: 3,
      tension: 0.35,
      pointRadius: 0
    });

    // PY2 Bande + Moyenne
    datasets.push({
      label: "",
      data: mean2.map((v, i) => v - std2[i]),
      backgroundColor: f2,
      borderColor: "transparent", // ⛔ aucun contour
      borderWidth: 0,
      fill: "+1",
      pointRadius: 0
    });
    datasets.push({
      label: `${label2} ± SD`,
      data: mean2.map((v, i) => v + std2[i]),
      backgroundColor: f2,
      borderColor: "transparent", // ⛔ aucun contour
      borderWidth: 0,
      fill: "-1",
      pointRadius: 0
    });
    datasets.push({
      label: label2,
      data: mean2,
      borderColor: c2,
      borderWidth: 3,
      tension: 0.35,
      pointRadius: 0
    });

    new Chart(canvas, {
      type: "line",
      data: { labels: x, datasets },
      options: chartOptions(joint, side)
    });
  }


  Chart.register({
    id: 'toeoff-line-plugin',
    afterDatasetDraw(chart) {
      const yScale = chart.scales.y;
      const xScale = chart.scales.x;

      chart.data.datasets.forEach(ds => {
        if (!ds.toeOff) return;

        const x = xScale.getPixelForValue(ds.toeOff.xIndex);
        const color = ds.toeOff.color;

        const top = yScale.top;
        const bottom = yScale.bottom;

        const ctx = chart.ctx;
        ctx.save();
        ctx.beginPath();

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;       // ⬅️ plus fine
        ctx.setLineDash([4, 4]);   // ⬅️ pointillé : 4px trait / 4px espace

        ctx.moveTo(x, top);
        ctx.lineTo(x, bottom);
        ctx.stroke();

        ctx.restore();
      });
    }
  });


  function refreshFormatting() {
    // 🔄 Re-render les graphes avec le nouveau format
    if (!pyLeft) return;

    const active =
      UIState?.currentPage === "page_one"
        ? "charts_one"
        : "charts_container";

    renderGaitCharts(active);
  }


  // ==============================================================
  //  🔹 Export global
  // ==============================================================
  global.Charts = {
    setPlane,
    setViewMode,
    getViewMode,
    getCurrentPlane,
    setData,
    renderGaitCharts,
    refreshFormatting
  };

})(window);
