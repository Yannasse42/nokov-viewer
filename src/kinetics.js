(function (global) {

  let data = null;

  function setData(pyData, label, containerId) {
    if (!pyData.force) {
      const c = document.getElementById(containerId);
      if (c) c.innerHTML = "<p>Aucune donnée force détectée.</p>";
      return;
    }
    data = pyData.force;
    render2D(containerId);
  }

  function render2D(containerId) {
    const area = document.getElementById(containerId);
    area.innerHTML = "";

    const grid = document.createElement("div");
    grid.className = "grf-grid";
    area.appendChild(grid);

    plotGRF(grid, "Fz", "Vertical GRF (N)");
    plotGRF(grid, "Fy", "Ant-Post GRF (N)");
    plotGRF(grid, "Fx", "Med-Lat GRF (N)");

  }

  function plotGRF(container, key, title) {
    const card = createCard(container);
    const canvas = document.createElement("canvas");
    card.appendChild(canvas);

    const x = data[key].map((_, i) => i);

    new Chart(canvas, {
      type: "line",
      data: {
        labels: x,
        datasets: [{
          label: title,
          data: data[key],
          borderColor: "#c4242c",
          borderWidth: 2,
          pointRadius: 0
        }]
      },
      options: baseOptions(title, "Samples", "Force (N)")
    });
  }

  function createCard(container, multi = "") {
    const card = document.createElement("div");
    card.className = "grf-card " + multi;
    container.appendChild(card);
    return card;
  }

  function baseOptions(title, xlbl, ylbl) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: xlbl },
          grid: { color: "rgba(0,0,0,0.1)" }
        },
        y: {
          title: { display: true, text: ylbl },
          grid: { color: "rgba(0,0,0,0.1)" }
        }
      },
      plugins: {
        legend: { display: false },
        title: { display: true, text: title }
      }
    };
  }

  global.Kinetics = { setData };

})(window);
