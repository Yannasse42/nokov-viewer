// src/charts.js
(function (global) {
  // ===========================
  //  State interne
  // ===========================
  let currentPlane = "sagittal"; // sagittal / frontal / transverse
  let viewMode = "compact";      // compact = 6 graphes, detailed = 12 graphes

  let pyLeft = null;
  let pyRight = null;
  let labelLeft = "Essai 1";
  let labelRight = "Essai 2";

  // ===========================
  //  Couleurs
  // ===========================
  const COLORS = {
    red1: "rgba(180, 0, 0, 1)",
    red1_fill: "rgba(180, 0, 0, 0.25)",
    red2: "rgba(255, 80, 80, 1)",
    red2_fill: "rgba(255, 80, 80, 0.25)",

    green1: "rgba(0, 140, 0, 1)",
    green1_fill: "rgba(0, 140, 0, 0.25)",
    green2: "rgba(120, 220, 120, 1)",
    green2_fill: "rgba(120, 220, 120, 0.25)"
  };

  // ===========================
  //  API publique
  // ===========================
  function setPlane(plane, containerId) {
    currentPlane = plane;
    if (!pyLeft) return;
    if (containerId) {
      renderGaitCharts(containerId);
    }
  }

  function setViewMode(mode, containerId) {
    viewMode = mode;
    if (!pyLeft) return;
    if (containerId) {
      renderGaitCharts(containerId);
    }
  }

  function getViewMode() {
    return viewMode;
  }

  function getCurrentPlane() {
    return currentPlane;
  }

  /**
   * Définit les données courantes et dessine les graphes.
   * @param {Object} py1 - résultat Python essai 1
   * @param {Object|null} py2 - résultat Python essai 2 (ou null)
   * @param {string} lbl1
   * @param {string} lbl2
   * @param {string} containerId - id du conteneur HTML des charts
   */
  function setData(py1, py2, lbl1, lbl2, containerId) {
    pyLeft = py1;
    pyRight = py2 || null;
    labelLeft = lbl1 || "Essai 1";
    labelRight = lbl2 || "Essai 2";

    if (containerId) {
      renderGaitCharts(containerId);
    }
  }

  /**
   * Redessine les graphes dans un conteneur donné,
   * en fonction de viewMode et de la présence/absence de pyRight.
   */
  function renderGaitCharts(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    if (!pyRight) {
      renderSimple(pyLeft, container, labelLeft);
      return;
    }

    if (viewMode === "compact") {
      renderCompact(pyLeft, pyRight, container, labelLeft, labelRight);
    } else {
      renderDetailed(pyLeft, pyRight, container, labelLeft, labelRight);
    }
  }

  // ===========================
  //  1) MODE SIMPLE (1 ESSAI)
  // ===========================
  function renderSimple(py1, container, label1) {
    const joints = ["Hip", "Knee", "Ankle"];
    const sides = ["L", "R"];
    const x = [...Array(101).keys()];

    for (const joint of joints) {
      for (const side of sides) {
        const meanSet = side === "L" ? py1.planes_L : py1.planes_R;
        const stdSet = side === "L" ? py1.planes_std_L : py1.planes_std_R;

        if (!meanSet || !stdSet || !meanSet[joint] || !stdSet[joint]) {
          continue;
        }

        const mean = meanSet[joint][currentPlane];
        const std = stdSet[joint][currentPlane];

        if (!mean || !std) continue;

        const lower = mean.map((v, i) => v - std[i]);
        const upper = mean.map((v, i) => v + std[i]);

        const isLeft = side === "L";
        const lineColor = isLeft ? COLORS.red1 : COLORS.green1;
        const fillColor = isLeft ? COLORS.red1_fill : COLORS.green1_fill;

        const card = document.createElement("div");
        card.className = "chart-card";
        const canvas = document.createElement("canvas");
        card.appendChild(canvas);
        container.appendChild(card);

        new Chart(canvas, {
          type: "line",
          data: {
            labels: x,
            datasets: [
              {
                label: label1,
                data: mean,
                borderColor: lineColor,
                borderWidth: 3,
                tension: 0.35,
                pointRadius: 0
              },
              {
                label: "lower",
                data: lower,
                borderColor: "transparent",
                backgroundColor: "transparent",
                pointRadius: 0,
                fill: false
              },
              {
                label: `${label1} SD`,
                data: upper,
                backgroundColor: fillColor,
                borderColor: "transparent",
                fill: "-1",
                pointRadius: 0
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,

            scales: {
              x: {
                title: { display: true, text: t("axes.x_cycle") }
              },
              y: {
                title: { display: true, text: t("axes.y_angle") }
              }
            },
            plugins: {
              legend: {
                labels: { filter: (item) => item.text !== "lower" }
              },
              title: {
                display: true,
                text: `${t("joint." + joint)} ${t("side." + side)} — ${t(
                  "planes." + currentPlane
                )}`
              }
            }
          }
        });
      }
    }
  }

  // ===========================
  //  2) MODE COMPACT (6 graphes, COMPARAISON)
  // ===========================
  function renderCompact(py1, py2, container, label1, label2) {
    const joints = ["Hip", "Knee", "Ankle"];
    const sides = ["L", "R"];
    const x = [...Array(101).keys()];

    for (const joint of joints) {
      for (const side of sides) {
        const meanSet1 = side === "L" ? py1.planes_L : py1.planes_R;
        const stdSet1  = side === "L" ? py1.planes_std_L : py1.planes_std_R;
        const meanSet2 = side === "L" ? py2.planes_L : py2.planes_R;
        const stdSet2  = side === "L" ? py2.planes_std_L : py2.planes_std_R;

        if (
          !meanSet1 || !stdSet1 ||
          !meanSet2 || !stdSet2 ||
          !meanSet1[joint] || !stdSet1[joint] ||
          !meanSet2[joint] || !stdSet2[joint]
        ) {
          continue;
        }

        const m1 = meanSet1[joint][currentPlane];
        const s1 = stdSet1[joint][currentPlane];
        const m2 = meanSet2[joint][currentPlane];
        const s2 = stdSet2[joint][currentPlane];

        if (!m1 || !s1 || !m2 || !s2) continue;

        const lower1 = m1.map((v, i) => v - s1[i]);
        const upper1 = m1.map((v, i) => v + s1[i]);
        const lower2 = m2.map((v, i) => v - s2[i]);
        const upper2 = m2.map((v, i) => v + s2[i]);

        const isLeft = side === "L";

        const line1 = isLeft ? COLORS.red1 : COLORS.green1;
        const fill1 = isLeft ? COLORS.red1_fill : COLORS.green1_fill;

        const line2 = isLeft ? COLORS.red2 : COLORS.green2;
        const fill2 = isLeft ? COLORS.red2_fill : COLORS.green2_fill;

        const card = document.createElement("div");
        card.className = "chart-card";
        const canvas = document.createElement("canvas");
        card.appendChild(canvas);
        container.appendChild(card);

        new Chart(canvas, {
          type: "line",
          data: {
            labels: x,
            datasets: [
              // COURBE ESSAI 1
              {
                label: label1,
                data: m1,
                borderColor: line1,
                borderWidth: 3,
                tension: 0.35,
                pointRadius: 0
              },
              {
                label: "lower1",
                data: lower1,
                borderColor: "transparent",
                backgroundColor: "transparent",
                pointRadius: 0,
                fill: false
              },
              {
                label: `${label1} SD`,
                data: upper1,
                backgroundColor: fill1,
                borderColor: "transparent",
                fill: "-1",
                pointRadius: 0
              },

              // COURBE ESSAI 2
              {
                label: label2,
                data: m2,
                borderColor: line2,
                borderWidth: 3,
                tension: 0.35,
                pointRadius: 0
              },
              {
                label: "lower2",
                data: lower2,
                borderColor: "transparent",
                backgroundColor: "transparent",
                pointRadius: 0,
                fill: false
              },
              {
                label: `${label2} SD`,
                data: upper2,
                backgroundColor: fill2,
                borderColor: "transparent",
                fill: "-1",
                pointRadius: 0
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                title: { display: true, text: t("axes.x_cycle") }
              },
              y: {
                title: { display: true, text: t("axes.y_angle") }
              }
            },
            plugins: {
              legend: {
                labels: {
                  filter: (item) =>
                    item.text !== "lower1" && item.text !== "lower2"
                }
              },
              title: {
                display: true,
                text: `${t("joint." + joint)} ${t("side." + side)} — ${t(
                  "planes." + currentPlane
                )} (${t("charts.comparison")})`
              }
            }
          }
        });
      }
    }
  }

  // ===========================
  //  3) MODE DÉTAILLÉ (12 graphes, COMPARAISON)
  // ===========================
  function renderDetailed(py1, py2, container, label1, label2) {
    const joints = ["Hip", "Knee", "Ankle"];
    const sides = ["L", "R"];
    const x = [...Array(101).keys()];

    // ======= Boucle : ESSAI 1 (6 graphes) =======
    for (const joint of joints) {
      for (const side of sides) {
        const meanSet = side === "L" ? py1.planes_L : py1.planes_R;
        const stdSet  = side === "L" ? py1.planes_std_L : py1.planes_std_R;

        if (!meanSet || !stdSet || !meanSet[joint] || !stdSet[joint]) {
          continue;
        }

        const m = meanSet[joint][currentPlane];
        const s = stdSet[joint][currentPlane];

        if (!m || !s) continue;

        const lower = m.map((v, i) => v - s[i]);
        const upper = m.map((v, i) => v + s[i]);

        const isLeft = side === "L";
        const lineColor = isLeft ? COLORS.red1 : COLORS.green1;
        const fillColor = isLeft ? COLORS.red1_fill : COLORS.green1_fill;

        const card = document.createElement("div");
        card.className = "chart-card";

        const canvas = document.createElement("canvas");
        card.appendChild(canvas);
        container.appendChild(card);

        new Chart(canvas, {
          type: "line",
          data: {
            labels: x,
            datasets: [
              {
                label: label1,
                data: m,
                borderColor: lineColor,
                borderWidth: 3,
                tension: 0.35,
                pointRadius: 0
              },
              {
                label: "lower1",
                data: lower,
                borderColor: "transparent",
                backgroundColor: "transparent",
                pointRadius: 0,
                fill: false
              },
              {
                label: `${label1} SD`,
                data: upper,
                fill: "-1",
                backgroundColor: fillColor,
                borderColor: "transparent",
                pointRadius: 0
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                title: { display: true, text: t("axes.x_cycle") }
              },
              y: {
                title: { display: true, text: t("axes.y_angle") }
              }
            },
            plugins: {
              legend: {
                labels: {
                  filter: (item) => item.text !== "lower1"
                }
              },
              title: {
                display: true,
                text: `${t("joint." + joint)} ${t(
                  "side." + side
                )} — ${t("planes." + currentPlane)} — ${label1}`
              }
            }
          }
        });
      }
    }

    // ======= Boucle : ESSAI 2 (6 graphes) =======
    for (const joint of joints) {
      for (const side of sides) {
        const meanSet = side === "L" ? py2.planes_L : py2.planes_R;
        const stdSet  = side === "L" ? py2.planes_std_L : py2.planes_std_R;

        if (!meanSet || !stdSet || !meanSet[joint] || !stdSet[joint]) {
          continue;
        }

        const m = meanSet[joint][currentPlane];
        const s = stdSet[joint][currentPlane];

        if (!m || !s) continue;

        const lower = m.map((v, i) => v - s[i]);
        const upper = m.map((v, i) => v + s[i]);

        const isLeft = side === "L";
        const lineColor = isLeft ? COLORS.red2 : COLORS.green2;
        const fillColor = isLeft ? COLORS.red2_fill : COLORS.green2_fill;

        const card = document.createElement("div");
        card.className = "chart-card";

        const canvas = document.createElement("canvas");
        card.appendChild(canvas);
        container.appendChild(card);

        new Chart(canvas, {
          type: "line",
          data: {
            labels: x,
            datasets: [
              {
                label: label2,
                data: m,
                borderColor: lineColor,
                borderWidth: 3,
                tension: 0.35,
                pointRadius: 0
              },
              {
                label: "lower2",
                data: lower,
                borderColor: "transparent",
                backgroundColor: "transparent",
                pointRadius: 0,
                fill: false
              },
              {
                label: `${label2} SD`,
                data: upper,
                fill: "-1",
                backgroundColor: fillColor,
                borderColor: "transparent",
                pointRadius: 0
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                title: { display: true, text: t("axes.x_cycle") }
              },
              y: {
                title: { display: true, text: t("axes.y_angle") }
              }
            },
            plugins: {
              legend: {
                labels: {
                  filter: (item) => item.text !== "lower2"
                }
              },
              title: {
                display: true,
                text: `${t("joint." + joint)} ${t(
                  "side." + side
                )} — ${t("planes." + currentPlane)} — ${label2}`
              }
            }
          }
        });
      }
    }
  }

  // ===========================
  //  Export global
  // ===========================
  global.Charts = {
    setPlane,
    setViewMode,
    getViewMode,
    getCurrentPlane,
    setData,
    renderGaitCharts
  };
})(window);
