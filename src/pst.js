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



  // ============================================================
  // 4) TABLE 1 ESSAI (LEFT + RIGHT)
  // ============================================================
  function fillPSTTable(id, data) {
    const isLeft = id.includes("left");
    const order = isLeft ? PST_ORDER : PST_ORDER_R;

    let html = `
      <tr>
        <th>${PST_HEADERS.header_param}</th>
        <th>${PST_HEADERS.header_mean_sd}</th>
      </tr>
    `;

    for (const key of order) {
      if (!(key in data)) continue;

      const [mean, sd] = data[key];

      const baseKey = key.replace("_L", "").replace("_R", "");
      const i18nKey = PST_LABEL_KEYS[baseKey] || baseKey;

      const label = t(i18nKey);

      html += `
        <tr>
          <td><strong>${label}</strong></td>
          <td class="value-wrapper">
            <span class="value-mean">${mean.toFixed(2)}</span>
            <span>±</span>
            <span class="value-sd">${sd.toFixed(2)}</span>
          </td>
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
      </tr>
    `;

    for (const key in g) {
      const i18nKey = PST_LABEL_KEYS[key] || key;
      const label   = t(i18nKey);

      globalHtml += `
        <tr>
          <td><strong>${label}</strong></td>
          <td>${g[key]}</td>
        </tr>
      `;
    }

    document.getElementById("pst-global-one").innerHTML = globalHtml;

    fillPSTTable("pst-left-one",  result.PST_L);
    fillPSTTable("pst-right-one", result.PST_R);
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
    // TABLEAU GLOBAL
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
        <th>Δ = ${name2} − ${name1}</th>
      </tr>
    `;

    GLOBAL_PARAMS.forEach(([label, key]) => {
      const v1 = py1.PST_global[key];
      const v2 = py2.PST_global[key];

      const i18nKey = PST_LABEL_KEYS[label] || label;
      const labelText = t(i18nKey);

      g += `
        <tr>
          <td><strong>${labelText}</strong></td>
          <td>${boldIfHigher(v1, v2)}</td>
          <td>${boldIfHigher(v2, v1)}</td>
          <td>${deltaCell(v1, v2)}</td>
        </tr>
      `;
    });

    document.getElementById("pst-global-table").innerHTML = g;



    // -----------------------------------------------------------
    // TABLEAU BILATÉRAL
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
        <th>${t("pst.header_value")}</th>
        <th>${name1}</th>
        <th>${name2}</th>
        <th>Δ</th>
      </tr>
    `;

    BILAT_PARAMS.forEach(([label, keyL, keyR]) => {

      const L1 = py1.PST_L[keyL][0];
      const L2 = py2.PST_L[keyL][0];
      const R1 = py1.PST_R[keyR][0];
      const R2 = py2.PST_R[keyR][0];

      const i18nKey  = PST_LABEL_KEYS[label] || label;
      const labelText = t(i18nKey);

      b += `
        <tr>
          <td rowspan="2"><strong>${labelText}</strong></td>
          <td class="pst-left-label">${t("pst.left")}</td>
          <td>${boldIfHigher(L1, L2)}</td>
          <td>${boldIfHigher(L2, L1)}</td>
          <td>${deltaCell(L1, L2)}</td>
        </tr>

        <tr>
          <td class="pst-right-label">${t("pst.right")}</td>
          <td>${boldIfHigher(R1, R2)}</td>
          <td>${boldIfHigher(R2, R1)}</td>
          <td>${deltaCell(R1, R2)}</td>
        </tr>
      `;
    });

    document.getElementById("pst-bilat-table").innerHTML = b;
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
