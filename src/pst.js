// --------------------------------------------------------------
//  pst.js — Version optimisée / commentée / 100% traduisible
// --------------------------------------------------------------
(function (global) {

  // ============================================================
  // 1) MAPPING — Tous les labels → clés i18n
  // ============================================================
  // On gère :
  //  - les clés globales envoyées par Python
  //  - les clés bilatérales envoyées par Python
  //  - les labels affichés dans le tableau de comparaison
  //
  // Ainsi TOUT passe dans la fonction t()
  // ============================================================

  const PST_LABEL_KEYS = {

    // ---------- GLOBAL ----------
    "Distance (m)": "pst.distance",
    "Duration (s)": "pst.duration",
    "Speed (m/s)": "pst.speed",
    "Cadence (step/min)": "pst.cadence",

    // Variantes Python
    "Walk Ratio": "pst.walk_ratio",
    "Walk_ratio": "pst.walk_ratio",
    "walk_ratio": "pst.walk_ratio",

    // ---------- BILAT PYTHON (baseKey sans _L/_R) ----------
    stride_length: "pst.stride_length",
    step_length: "pst.step_length",
    support_base: "pst.support_base",

    Step_time: "pst.step_time",
    Stride_time: "pst.stride_time",

    Swing_phase: "pst.swing",
    Stance_phase: "pst.stance",
    double_support: "pst.double_support",

    // ---------- BILAT COMPARAISON (labels affichés) ----------
    "Stride length (mm)": "pst.stride_length",
    "Step length (mm)": "pst.step_length",
    "Support base (mm)": "pst.support_base",

    "Step time (s)": "pst.step_time",
    "Stride time (s)": "pst.stride_time",

    "Swing phase (% GC)": "pst.swing",
    "Stance phase (% GC)": "pst.stance",
    "Double support (% GC)": "pst.double_support",
  };

  // Permet de mapper les labels réels aux clés de normes globales
  const PST_GLOBAL_MAP = {
    "Distance (m)": null,
    "Duration (s)": null,
    "Speed (m/s)": "speed",
    "Cadence (step/min)": "cadence",
    "Walk Ratio": "walk_ratio",
    "Walk_ratio": "walk_ratio",
    "walk_ratio": "walk_ratio"
  };




  // ============================================================
  // RADAR PST — Normalisation EXACT Python style 🧠
  // ============================================================

  let pstRadarChart = null;

  const PST_RADAR_METRICS = [
    { id: "stride_length",  normKey: "stride_length",  keyL: "stride_length_L",  keyR: "stride_length_R" },
    { id: "step_length",    normKey: "step_length",    keyL: "step_length_L",    keyR: "step_length_R" },
    { id: "support_base",   normKey: "support_base",   keyL: "support_base_L",   keyR: "support_base_R" },
    { id: "Step_time",      normKey: "step_time",      keyL: "Step_time_L",      keyR: "Step_time_R" },
    { id: "Stride_time",    normKey: "stride_time",    keyL: "Stride_time_L",    keyR: "Stride_time_R" },
    { id: "Swing_phase",    normKey: "swing_phase",    keyL: "Swing_phase_L",    keyR: "Swing_phase_R" },
    { id: "Stance_phase",   normKey: "stance_phase",   keyL: "Stance_phase_L",   keyR: "Stance_phase_R" },
    { id: "double_support", normKey: "double_support", keyL: "double_support_L", keyR: "double_support_R" }
  ];

  const PST_GLOBAL_NORMS = {
    speed:       { min: 1.11, max: 1.39 },  // 4–5 km/h convertis en m/s
    cadence:     { min: 100,  max: 120  },  // step/min
    walk_ratio:  { min: 0.52, max: 0.64 }   // 0.58 ± 0.06
  };




  // Normes réelles identiques Python
  const PST_RADAR_NORMS = {
    // spatial — distances  
    stride_length:  { min: 1200, max: 1800 },  // mm → 120-180 cm  
    step_length:    { min: 550,   max: 900   },   // cm → 0,55-0,90 m  
    support_base:   { min: 50,    max: 150   },   // cm → 5-15 cm  
    // temporal — cadence / temps  
    step_time:      { min: 0.45, max: 0.70 },   // secondes (soit ~86 à ~133 pas/min)  
    stride_time:    { min: 0.90, max: 1.40 },   // secondes (≈ 0.45*2 à 0.70*2)  
    // phases — % du cycle  
    swing_phase:    { min: 30,   max: 50  },     // swing ~ 30-50%  
    stance_phase:   { min: 50,   max: 70  },     // stance ~ 50-70%  
    double_support: { min: 10,   max: 30  }      // double appui ~ 10-30%  

  };

  // 👉 Toujours Low=0.4 & High=0.6 visuellement
  function normalize(value, norm) {
    const { min, max } = norm;
    if (!value && value !== 0) return 0.5;
    return 0.4 + 0.2 * ((value - min) / (max - min));
  }

  function pstRadar_render(result) {
    const canvas = document.getElementById("pst-radar-canvas-one");
    if (!canvas) return;
    if (pstRadarChart) pstRadarChart.destroy();

    const left = result.PST_L;
    const right = result.PST_R;

    const low = Array(PST_RADAR_METRICS.length).fill(0.4);
    const high = Array(PST_RADAR_METRICS.length).fill(0.6);

    const dataLeft = PST_RADAR_METRICS.map(m =>
      normalize(left[m.keyL][0], PST_RADAR_NORMS[m.normKey])
    );
    const dataRight = PST_RADAR_METRICS.map(m =>
      normalize(right[m.keyR][0], PST_RADAR_NORMS[m.normKey])
    );

    const radarLabels = PST_RADAR_METRICS.map(m =>
      t(PST_LABEL_KEYS[m.id] || m.id)
    );

    pstRadarChart = new Chart(canvas, {
      type: "radar",
      data: {
        labels: radarLabels,
        datasets: [
          {
            label: t("pst.norm"), // 👈 traduit
            data: high,
            backgroundColor: "rgba(53,84,116,0.20)",
            borderColor: "transparent",
            pointRadius: 0,
            fill: false
          },
          {
            label: "", 
            data: low,
            borderColor: "transparent",
            pointRadius: 0,
            fill: "-1",
            hoverRadius: 0,
            hitRadius: 0,
            pointHitRadius: 0
          },
          {
            label: t("pst.left"), // 👈 traduit
            data: dataLeft,
            borderColor: "#c4242c",
            pointBackgroundColor: "#c4242c",
            pointRadius: 4,
            backgroundColor: "transparent",
            borderWidth: 2,
            fill: false
          },
          {
            label: t("pst.right"), // 👈 traduit
            data: dataRight,
            borderColor: "rgb(0,150,0)",
            pointBackgroundColor: "rgb(0,150,0)",
            pointRadius: 4,
            backgroundColor: "transparent",
            borderWidth: 2,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: {
              filter: function(item) {
                return item.text !== ""; // 👈 enlève le 2nd gris
              },
              font: {
                weight: "700"  // 👈 Légende en gras
              },
              color: "#000"
            }
          }
        },
        scales: {
          r: {
            min: 0.10,
            max: 0.9,
            grid: { circular: true },
            ticks: { display: false },
            pointLabels: {
              font: {
                weight: "700", // 👈 Labels du radar en gras
                size: 14
              },
              color: "#333"
            }
          }
        }
      }

    });

  }


  function pstRadar_compare(py1, py2, name1, name2) {
    const canvas = document.getElementById("pst-radar-canvas-compare");
    if (!canvas) return;
    if (pstRadarChart) pstRadarChart.destroy();

    const low = Array(PST_RADAR_METRICS.length).fill(0.4);
    const high = Array(PST_RADAR_METRICS.length).fill(0.6);

    const L1 = PST_RADAR_METRICS.map(m => normalize(py1.PST_L[m.keyL][0], PST_RADAR_NORMS[m.normKey]));
    const R1 = PST_RADAR_METRICS.map(m => normalize(py1.PST_R[m.keyR][0], PST_RADAR_NORMS[m.normKey]));
    const L2 = PST_RADAR_METRICS.map(m => normalize(py2.PST_L[m.keyL][0], PST_RADAR_NORMS[m.normKey]));
    const R2 = PST_RADAR_METRICS.map(m => normalize(py2.PST_R[m.keyR][0], PST_RADAR_NORMS[m.normKey]));

    const radarLabels = PST_RADAR_METRICS.map(m => t(PST_LABEL_KEYS[m.id] || m.id));

    pstRadarChart = new Chart(canvas, {
      type: "radar",
      data: {
        labels: radarLabels,
        datasets: [
          {
            label: t("pst.norm"),
            data: high,
            backgroundColor: "rgba(53,84,116,0.15)",
            borderColor: "transparent",
            pointRadius: 0,
            fill: false
          },
          {
            label: "",
            data: low,
            borderColor: "transparent",
            pointRadius: 0,
            fill: "-1"
          },

          // Essai 1
          {
            label: `${name1} — ${t("pst.left")}`,
            data: L1,
            borderColor: "#a30000", // Rouge foncé
            pointBackgroundColor: "#a30000",
            pointRadius: 4,
            borderWidth: 2,
            fill: false
          },
          {
            label: `${name1} — ${t("pst.right")}`,
            data: R1,
            borderColor: "#004b00", // Vert foncé
            pointBackgroundColor: "#004b00",
            pointRadius: 4,
            borderWidth: 2,
            fill: false
          },

          // Essai 2
          {
            label: `${name2} — ${t("pst.left")}`,
            data: L2,
            borderColor: "#ff4d4d", // Rouge clair
            pointBackgroundColor: "#ff4d4d",
            pointRadius: 4,
            borderWidth: 2,
            fill: false
          },
          {
            label: `${name2} — ${t("pst.right")}`,
            data: R2,
            borderColor: "#1aff1a", // Vert clair
            pointBackgroundColor: "#1aff1a",
            pointRadius: 4,
            borderWidth: 2,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: {
              filter: item => item.text !== "",
              font: { weight: "700" },
              color: "#000"
            }
          }
        },
        scales: {
          r: {
            min: 0.1,
            max: 0.9,
            grid: { circular: true },
            ticks: { display: false },
            pointLabels: {
              font: { weight: "700", size: 14 },
              color: "#333"
            }
          }
        }
      }
    });
  }


  // ============================================================
  // 2) HEADERS DU TABLEAU — Dépend de la langue
  // ============================================================
  const PST_HEADERS = {
    header_param: "",
    header_value: "",
    header_mean_sd: ""
  };

  function initHeaders() {
    PST_HEADERS.header_param   = t("pst.header_param");
    PST_HEADERS.header_value   = t("pst.header_value");
    PST_HEADERS.header_mean_sd = t("pst.header_mean_sd");
  }



  // ============================================================
  // 3) ORDRE CLINIQUE — Gauche et Droite
  // ============================================================
  const PST_ORDER = [
    "stride_length_L",
    "step_length_L",
    "support_base_L",

    "Step_time_L",
    "Stride_time_L",

    "Swing_phase_L",
    "Stance_phase_L",
    "double_support_L"
  ];

  const PST_ORDER_R = PST_ORDER.map(k => k.replace("_L", "_R"));

  function getNormRange(key) {
    const base = key.replace("_L", "").replace("_R", "").toLowerCase();
    return PST_RADAR_NORMS[base] || { min: 0, max: 1 };
  }

  function createMiniGraph(value, key, isGlobal = false) {
    const { min, max } = isGlobal ? PST_GLOBAL_NORMS[key] : getNormRange(key);
    if (!isFinite(value)) return "";

    const isLeft = key.includes("_L");
    const cursorColor = isGlobal ? "#000" : (isLeft ? "#c4242c" : "rgb(0,150,0)");

    const isOutOfNorm = (value < min || value > max);

    const amplitude = max - min;
    const margin = amplitude * 0.25;

    const rangeMin = Math.min(min - margin, value - margin);
    const rangeMax = Math.max(max + margin, value + margin);

    const normStart = ((min - rangeMin) / (rangeMax - rangeMin)) * 100;
    const normWidth = (amplitude / (rangeMax - rangeMin)) * 100;
    const pos = ((value - rangeMin) / (rangeMax - rangeMin)) * 100;

    return `
      <div class="pst-graph-wrapper ${isOutOfNorm ? "out-of-norm" : ""}">
        <div class="pst-value-text">${value.toFixed(2)}</div>
        <div class="pst-mini-graph">
          <div class="pst-bar-bg"></div>
          <div class="pst-norm-bar"
              style="left:${normStart}%; width:${normWidth}%;"></div>
          <div class="pst-value-marker"
              style="left:${pos}%; background:${cursorColor};"></div>
        </div>
        <div class="pst-norm-text">
          <span>${min.toFixed(2)}</span>
          <span>${max.toFixed(2)}</span>
        </div>
      </div>
    `;
  }



  // ============================================================
  // 4) TABLEAU BILAT (100% traduit + mini-graph Norme)
  // ============================================================
  function fillPSTTable(id, data) {
    const isLeft = id.includes("left");
    const order = isLeft ? PST_ORDER : PST_ORDER_R;

    let html = `
      <tr>
        <th>${PST_HEADERS.header_param}</th>
        <th>${PST_HEADERS.header_mean_sd}</th>
        <th>${t("pst.norm")}</th>
      </tr>
    `;

    for (const key of order) {
      if (!(key in data)) continue;

      const [mean, sd] = data[key];

      const baseKey = key.replace("_L", "").replace("_R", "");
      const label = t(PST_LABEL_KEYS[baseKey] || baseKey);

      html += `
        <tr>
          <td><strong>${label}</strong></td>
          <td>
            <span class="value-mean">${mean.toFixed(2)}</span>
            <span>±</span>
            <span class="value-sd">${sd.toFixed(2)}</span>
          </td>
          <td>${createMiniGraph(mean, key)}</td>
        </tr>
      `;
    }

    document.getElementById(id).innerHTML = html;
  }


  // ============================================================
  // 5) MODE ONE — Tableau complet
  // ============================================================
  function displayPST_one(result) {

    const g = result.PST_global;

    let globalHtml = `
      <tr>
        <th>${PST_HEADERS.header_param}</th>
        <th>${PST_HEADERS.header_value}</th>
        <th>${t("pst.norm")}</th>
      </tr>
    `;

    for (const key in g) {
      const i18nKey = PST_LABEL_KEYS[key] || key;
      const label   = t(i18nKey);

      const normKey = PST_GLOBAL_MAP[key];
      const miniGraph =
        normKey && PST_GLOBAL_NORMS[normKey]
          ? createMiniGraph(g[key], normKey, true)
          : "";

      globalHtml += `
        <tr>
          <td><strong>${label}</strong></td>
          <td><span class="value-mean">${g[key].toFixed(2)}</span></td>
          <td>${miniGraph}</td>
        </tr>
      `;
    }

    document.getElementById("pst-global-one").innerHTML = globalHtml;

    fillPSTTable("pst-left-one",  result.PST_L);
    fillPSTTable("pst-right-one", result.PST_R);

    pstRadar_render(result);
  }



  // ============================================================
  // 6) MODE COMPARE — Tableaux GLOBAL + BILAT
  // ============================================================
  function displayPST_compare(py1, py2, name1, name2) {

    // Titres traduits
    document.getElementById("pst-title-global").textContent =
      t("compare.global_title");

    document.getElementById("pst-title-bilat").textContent =
      t("compare.bilat_title");

    document.getElementById("pst-delta-info").textContent =
      t("compare.delta_info").replace("{e1}", name1).replace("{e2}", name2);


    // --- Helpers internes ---
    const deltaCell = (v1, v2) => {
      const d = (v2 - v1).toFixed(2);
      if (d > 0) return `<span class="val-better">+${d}</span>`;
      if (d < 0) return `<span class="val-worse">${d}</span>`;
      return `<span class="val-equal">0.00</span>`;
    };

    const boldIfHigher = (v, compareTo) =>
      v >= compareTo
        ? `<span class="pst-bold">${v}</span>`
        : v.toFixed(2);


  // -----------------------------------------------------------
  // TABLEAU GLOBAL (Norme dans une seule colonne, 2 graphiques)
  // -----------------------------------------------------------
  const GLOBAL_PARAMS = [
    ["Distance (m)", "Distance (m)"],
    ["Duration (s)", "Duration (s)"],
    ["Speed (m/s)", "Speed (m/s)"],
    ["Cadence (step/min)", "Cadence (step/min)"],
    ["Walk Ratio", "Walk_ratio"]
  ];

  let g = `
    <tr>
      <th>${t("pst.header_param")}</th>
      <th>${name1}</th>
      <th>${name2}</th>
      <th>${t("pst.norm")}</th>
      <th>Δ = ${name2} − ${name1}</th>
    </tr>
  `;

  GLOBAL_PARAMS.forEach(([label, key]) => {
    const v1 = py1.PST_global[key];
    const v2 = py2.PST_global[key];

    const i18nKey = PST_LABEL_KEYS[label] || label;
    const labelText = t(i18nKey);

    const normKey = PST_GLOBAL_MAP[label];

    const mini1 = normKey ? createMiniGraph(v1, normKey, true) : "";
    const mini2 = normKey ? createMiniGraph(v2, normKey, true) : "";

    const v1Html = v1 >= v2
      ? `<strong>${v1.toFixed(2)}</strong>`
      : v1.toFixed(2);

    const v2Html = v2 >= v1
      ? `<strong>${v2.toFixed(2)}</strong>`
      : v2.toFixed(2);

    g += `
      <tr>
        <td><strong>${labelText}</strong></td>
        <td>${v1Html}</td>
        <td>${v2Html}</td>
        <td class="pst-norm-col">
          <div class="pst-compare-norm">
            ${mini1}
            ${mini2}
          </div>
        </td>
        <td>${deltaCell(v1, v2)}</td>
      </tr>
    `;
  });

  document.getElementById("pst-global-table").innerHTML = g;

    // -----------------------------------------------------------
    // TABLEAU BILATÉRAL — 2 mini-graphes par ligne (Tommy+Alex)
    // -----------------------------------------------------------
    const BILAT_PARAMS = [
      ["Stride length (mm)",  "stride_length_L",  "stride_length_R"],
      ["Step length (mm)",    "step_length_L",    "step_length_R"],
      ["Support base (mm)",   "support_base_L",   "support_base_R"],
      ["Step time (s)",       "Step_time_L",      "Step_time_R"],
      ["Stride time (s)",     "Stride_time_L",    "Stride_time_R"],
      ["Swing phase (% GC)",  "Swing_phase_L",    "Swing_phase_R"],
      ["Stance phase (% GC)", "Stance_phase_L",   "Stance_phase_R"],
      ["Double support (% GC)","double_support_L", "double_support_R"]
    ];

    let b = `
      <tr>
        <th>${t("pst.header_param")}</th>
        <th></th>
        <th>${name1}</th>
        <th>${name2}</th>
        <th>${t("pst.norm")}</th>
        <th>Δ</th>
      </tr>
    `;

    BILAT_PARAMS.forEach(([label, keyL, keyR]) => {

      const L1 = py1.PST_L[keyL][0];
      const L2 = py2.PST_L[keyL][0];
      const R1 = py1.PST_R[keyR][0];
      const R2 = py2.PST_R[keyR][0];

      const labelText = t(PST_LABEL_KEYS[label] || label);

      const miniTom_L = createMiniGraph(L1, keyL);
      const miniAlex_L = createMiniGraph(L2, keyL);

      const miniTom_R = createMiniGraph(R1, keyR);
      const miniAlex_R = createMiniGraph(R2, keyR);

      b += `
        <tr>
          <td rowspan="2"><strong>${labelText}</strong></td>
          <td class="pst-left-label">${t("pst.left")}</td>
          <td>${boldIfHigher(L1, L2)}</td>
          <td>${boldIfHigher(L2, L1)}</td>
          <td>
            <div class="pst-compare-norm">
              ${miniTom_L}
              ${miniAlex_L}
            </div>
          </td>
          <td>${deltaCell(L1, L2)}</td>
        </tr>

        <tr>
          <td class="pst-right-label">${t("pst.right")}</td>
          <td>${boldIfHigher(R1, R2)}</td>
          <td>${boldIfHigher(R2, R1)}</td>
          <td>
            <div class="pst-compare-norm">
              ${miniTom_R}
              ${miniAlex_R}
            </div>
          </td>
          <td>${deltaCell(R1, R2)}</td>
        </tr>
      `;
    });

    document.getElementById("pst-bilat-table").innerHTML = b;

    pstRadar_compare(py1, py2, name1, name2);

  }



  // ============================================================
  // 7) EXPORT
  // ============================================================
  global.PST = {
    initHeaders,
    displayPST_one,
    displayPST_compare,
    PST_LABEL_KEYS,
    PST_HEADERS,
    PST_ORDER,
    PST_ORDER_R
  };

})(window);
