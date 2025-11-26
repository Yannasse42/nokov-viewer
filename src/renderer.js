// ============================================================================
//  renderer.js — Version propre / optimisée / full commentée
// ============================================================================
//
//  Gère :
//   • Navigation entre pages
//   • Gestion des onglets (Courbes / PST)
//   • Sélection du plan (sagittal / frontal / transverse)
//   • Réinitialisation des pages
//   • Drag & Drop
//   • Chargement Python → Charts + PST
//
// ============================================================================


// ============================================================================
// 1) ÉTAT GLOBAL UI
// ============================================================================
const UIState = {
    currentPage: "home",
    currentTab: null,
    currentPlane_one: "sagittal",
    currentPlane_compare: "sagittal",
};

// Ajout pour mémoriser résultats comparaison
let currentPyCompare1 = null;
let currentPyCompare2 = null;

// Ajout pour l’analyse simple
let currentPyOneResult = null;


// ============================================================================
// 2) UI MANAGER
// ============================================================================
const UIManager = {

    // ------------------------------------------------------------
    // Changer de page (Home / One / Compare)
    // ------------------------------------------------------------
    showPage(pageId) {
        const pages = ["page_home", "page_one", "page_compare"];
        UIState.currentPage = pageId;

        pages.forEach(p => document.getElementById(p).classList.remove("active"));
        document.getElementById(pageId).classList.add("active");

        // Si on arrive sur une page de courbes, on restaure le plan mémorisé
        if (pageId !== "page_home" && UIState.currentTab?.includes("curves")) {
            UIManager.selectDefaultPlane();
        }

        UIManager.handlePlaneViewVisibility();
    },


    // ------------------------------------------------------------
    // Afficher la barre d’onglets (ONE / COMPARE)
    // ------------------------------------------------------------
    showTabs(pageType) {

        // Toujours revenir sur SAGITTAL quand on ouvre un set d’onglets
        if (pageType === "one")    UIState.currentPlane_one = "sagittal";
        if (pageType === "compare") UIState.currentPlane_compare = "sagittal";

        const isOne = pageType === "one";

        document.getElementById("tabs-one").style.display = isOne ? "flex" : "none";
        document.getElementById("tabs-compare").style.display = !isOne ? "flex" : "none";

        // Masquer tous les contenus onglets
        document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");

        // Activer directement l’onglet "COURBES"
        UIManager.activateTab(isOne ? "tab-curves-one" : "tab-curves-compare");
    },


    // ------------------------------------------------------------
    // Activer un onglet
    // ------------------------------------------------------------
    activateTab(tabId) {
        UIState.currentTab = tabId;

        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(c => c.style.display = "none");

        const btn = document.querySelector(`[data-tab="${tabId}"]`);
        if (btn) btn.classList.add("active");

        const content = document.getElementById(tabId);
        if (content) content.style.display = "block";

        // Sur un onglet COURBES, forcer affichage du plan courant
        if (tabId.includes("curves")) UIManager.selectDefaultPlane();

        UIManager.handlePlaneViewVisibility();
    },


    // ------------------------------------------------------------
    // Afficher/cacher le sélecteur de plan selon l’onglet actif
    // ------------------------------------------------------------
    handlePlaneViewVisibility() {
        const container = (UIState.currentPage === "page_one")
            ? document.querySelector("#tab-curves-one .plane-view-container")
            : document.querySelector("#tab-curves-compare .plane-view-container");

        if (!container) return;

        const isCurvesTab = UIState.currentTab?.includes("curves");

        container.style.display =
            (UIState.currentPage !== "home" && isCurvesTab)
                ? "flex"
                : "none";
    },


    // ------------------------------------------------------------
    // Effacer tous les graphiques
    // ------------------------------------------------------------
    clearCharts() {
        document.getElementById("charts_one").innerHTML = "";
        document.getElementById("charts_container").innerHTML = "";
    },


    // ------------------------------------------------------------
    // Reset page ONE
    // ------------------------------------------------------------
    resetOnePage() {
        document.getElementById("one_nom").value = "";
        document.getElementById("one_dossier").value = "";
        UIManager.clearCharts();
    },


    // ------------------------------------------------------------
    // Reset page COMPARE
    // ------------------------------------------------------------
    resetComparePage() {
        document.getElementById("nom1").value = "";
        document.getElementById("nom2").value = "";
        document.getElementById("dossier1").value = "";
        document.getElementById("dossier2").value = "";
        UIManager.clearCharts();
    },


    // ------------------------------------------------------------
    // Appliquer automatiquement le bon plan dans l’UI + Charts
    // ------------------------------------------------------------
    selectDefaultPlane() {
        const page = UIState.currentPage;

        // Plane mémorisé selon la page
        const plane = (page === "page_one")
            ? UIState.currentPlane_one
            : UIState.currentPlane_compare;

        const selector = `#${page} input[name="plane"][value="${plane}"]`;
        const radio = document.querySelector(selector);
        if (radio) radio.checked = true;

        // Et on met à jour les graphes
        Charts.setPlane(
            plane,
            page === "page_one" ? "charts_one" : "charts_container"
        );
    }
};



// ============================================================================
// 3) Helper Drag&Drop
// ============================================================================
function setupDropZone(inputElement) {
    inputElement.addEventListener("dragover", e => {
        e.preventDefault();
        inputElement.classList.add("dragover");
    });

    inputElement.addEventListener("dragleave", e => {
        e.preventDefault();
        inputElement.classList.remove("dragover");
    });

    inputElement.addEventListener("drop", e => {
        e.preventDefault();
        inputElement.classList.remove("dragover");

        const files = e.dataTransfer.files;
        if (files.length > 0) inputElement.value = files[0].path;
    });
}



// ============================================================================
// 4) DOMContentLoaded — Initialisation principale
// ============================================================================
window.addEventListener("DOMContentLoaded", () => {

    // ------------------ Langue --------------------------------
    const savedLang = localStorage.getItem("language") || "fr";
    applyTranslations(savedLang);
    PST.initHeaders();

    // ------------------ Préconfiguration plan sagittal ---------
    const sagittalOne     = document.querySelector('#page_one input[name="plane"][value="sagittal"]');
    const sagittalCompare = document.querySelector('#page_compare input[name="plane"][value="sagittal"]');
    if (sagittalOne)     sagittalOne.checked     = true;
    if (sagittalCompare) sagittalCompare.checked = true;

    Charts.setPlane("sagittal", "charts_one");
    Charts.setPlane("sagittal", "charts_container");


    // ======================================================================
    //  DOM Elements
    // ======================================================================
    const dossier1 = document.getElementById("dossier1");
    const dossier2 = document.getElementById("dossier2");

    const btnChoisir1    = document.getElementById("btn-choisir1");
    const btnChoisir2    = document.getElementById("btn-choisir2");
    const validateBtn    = document.getElementById("validate-btn");
    const btnOneValidate = document.getElementById("btn_one_validate");

    const toggleBtn       = document.getElementById("toggle-view");
    const loadingOverlay  = document.getElementById("loading-overlay");

    const viewModeBox = document.querySelector(".plane-view-container");
    if (viewModeBox) viewModeBox.style.display = "none";

    let essai1Name = "";
    let essai2Name = "";


    // ======================================================================
    // Helpers UI
    // ======================================================================
    const showLoading = () => loadingOverlay.style.display = "flex";
    const hideLoading = () => loadingOverlay.style.display = "none";

    const getActiveChartContainerId = () =>
        (UIState.currentPage === "page_one") ? "charts_one" : "charts_container";


    // ======================================================================
    // Changement de langue dynamique
    // ======================================================================
    window.electronAPI.onSetLanguage((event, lang) => {
        applyTranslations(lang);
        localStorage.setItem("language", lang);
        window.electronAPI.setMenuLanguage(lang);
        PST.initHeaders();
    });


    // ======================================================================
    // Navigation
    // ======================================================================
    document.getElementById("go_one").addEventListener("click", () => {
        UIManager.resetOnePage();
        UIManager.showPage("page_one");
    });

    document.getElementById("go_compare").addEventListener("click", () => {
        UIManager.resetComparePage();
        UIManager.showPage("page_compare");
    });

    document.getElementById("btn_return_home_one")
        .addEventListener("click", () => UIManager.showPage("page_home"));

    document.getElementById("btn_return_home_compare")
        .addEventListener("click", () => UIManager.showPage("page_home"));


    // ======================================================================
    // Onglets (Courbes / PST)
    // ======================================================================
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", () => UIManager.activateTab(btn.dataset.tab));
    });


    // ======================================================================
    // Drag & Drop
    // ======================================================================
    setupDropZone(dossier1);
    setupDropZone(dossier2);

    btnChoisir1.addEventListener("click", async () => {
        const folder = await window.electronAPI.selectFolder();
        if (folder) dossier1.value = folder;
    });

    btnChoisir2.addEventListener("click", async () => {
        const folder = await window.electronAPI.selectFolder();
        if (folder) dossier2.value = folder;
    });

    document.getElementById("btn_one_dossier").addEventListener("click", async () => {
        const folder = await window.electronAPI.selectFolder();
        if (folder) document.getElementById("one_dossier").value = folder;
    });



    // ======================================================================
    // Sélection du plan (sagittal / frontal / transverse)
    document.querySelectorAll('input[name="plane"]').forEach(radio => {
        radio.addEventListener("change", e => {
            const plane = e.target.value;

            if (UIState.currentPage === "page_one") {
                UIState.currentPlane_one = plane;
                Charts.setPlane(plane, "charts_one");
                renderKinematicSummary(currentPyOneResult, plane); // OK page ONE

            } else {
                UIState.currentPlane_compare = plane;
                Charts.setPlane(plane, "charts_container");

                // 🟢 Mise à jour dynamique du tableau cinématique comparaison
                if (currentPyCompare1 && currentPyCompare2) {
                    displayKinematic_compare(
                        currentPyCompare1,
                        currentPyCompare2,
                        essai1Name,
                        essai2Name,
                        plane
                    );
                }
            }
        });
    });




    // ======================================================================
    // Toggle mode 6 / 12 graphes
    // ======================================================================
    toggleBtn.addEventListener("click", () => {
        const mode = Charts.getViewMode() === "compact" ? "detailed" : "compact";
        Charts.setViewMode(mode, getActiveChartContainerId());

        toggleBtn.textContent =
            mode === "compact" ? t("compare.view6") : t("compare.view12");
    });



    // ======================================================================
    // Analyse 1 ESSAI
    // ======================================================================
    btnOneValidate.addEventListener("click", async () => {
        const dossier = document.getElementById("one_dossier").value.trim();
        if (!dossier) return alert("Veuillez sélectionner un dossier d’essai.");

        if (!await window.electronAPI.folderExists(dossier))
            return alert(`Le dossier n'existe pas :\n${dossier}`);

        showLoading();

        const files = await window.electronAPI.detectFiles(dossier);
        if (!files.htr || !files.trc) {
            hideLoading();
            return alert(`Aucun fichier .HTR ou .TRC trouvé dans :\n${dossier}`);
        }

        let modele = await window.electronAPI.detectModel(files.trc);
        if (modele === "unknown") modele = "cgm23";

        essai1Name = document.getElementById("one_nom").value.trim()
                  || window.electronAPI.basename(dossier);

        const pyResult = await window.electronAPI.runPython({
            htr: files.htr, trc: files.trc, modele
        });

        currentPyOneResult = pyResult;   // <<< AJOUT ICI


        hideLoading();

        PST.displayPST_one(pyResult);
        Charts.setData(pyResult, null, essai1Name, "", "charts_one");
        renderKinematicSummary(pyResult, "sagittal");


        UIManager.showTabs("one");
        UIManager.activateTab("tab-curves-one");
    });



    // ======================================================================
    // Analyse COMPARAISON
    // ======================================================================
    validateBtn.addEventListener("click", async () => {

        const d1 = dossier1.value.trim();
        const d2 = dossier2.value.trim();

        if (!d1 || !d2)
            return alert("Merci de sélectionner les dossiers des deux essais.");

        if (!await window.electronAPI.folderExists(d1))
            return alert(`Le dossier n'existe pas :\n${d1}`);

        if (!await window.electronAPI.folderExists(d2))
            return alert(`Le dossier n'existe pas :\n${d2}`);

        showLoading();

        const f1 = await window.electronAPI.detectFiles(d1);
        const f2 = await window.electronAPI.detectFiles(d2);

        if (!f1.htr || !f1.trc) {
            hideLoading();
            return alert(`Aucun fichier HTR/TRC trouvé dans :\n${d1}`);
        }
        if (!f2.htr || !f2.trc) {
            hideLoading();
            return alert(`Aucun fichier HTR/TRC trouvé dans :\n${d2}`);
        }

        let m1 = await window.electronAPI.detectModel(f1.trc);
        let m2 = await window.electronAPI.detectModel(f2.trc);
        if (m1 === "unknown") m1 = "cgm23";
        if (m2 === "unknown") m2 = "cgm23";

        essai1Name = document.getElementById("nom1").value.trim()
                  || window.electronAPI.basename(d1);
        essai2Name = document.getElementById("nom2").value.trim()
                  || window.electronAPI.basename(d2);

        const py1 = await window.electronAPI.runPython({
            htr: f1.htr, trc: f1.trc, modele: m1
        });

        const py2 = await window.electronAPI.runPython({
            htr: f2.htr, trc: f2.trc, modele: m2
        });

        currentPyCompare1 = py1;
        currentPyCompare2 = py2;


        hideLoading();

        Charts.setData(py1, py2, essai1Name, essai2Name, "charts_container");

        PST.displayPST_compare(py1, py2, essai1Name, essai2Name);

        displayKinematic_compare(py1, py2, essai1Name, essai2Name, UIState.currentPlane_compare);

        
        UIManager.showTabs("compare");
        UIManager.activateTab("tab-curves-compare");


    });


    // =============================================================
    //   Helper : traduction interne des labels cinématiques
    // =============================================================
    function getKinematicLabel(baseKey) {

        if (baseKey.startsWith("Flex max")) {
            const joint = baseKey.replace("Flex max ", "");
            return t(`kinematic.flexmax.${joint.toLowerCase()}`);
        }

        if (baseKey.startsWith("Index flex max")) {
            const joint = baseKey.replace("Index flex max ", "");
            return t(`kinematic.index.${joint.toLowerCase()}`);
        }

        if (baseKey.startsWith("RoM")) {
            const joint = baseKey.replace("RoM ", "");
            return t(`kinematic.rom.${joint.toLowerCase()}`);
        }

        return baseKey;
    }




    // ============================================================================
    //   PARAMÈTRES CINÉMATIQUES — Rendu dynamique complet
    // ============================================================================
    function renderKinematicSummary(py, plane = "sagittal") {

        function formatValue(key, obj) {
            const mean = obj.mean.toFixed(2);
            const sd   = obj.std.toFixed(2);

            if (key.toLowerCase().includes("index")) {
                return `${mean}% ± ${sd}`;
            }
            return `${mean}° ± ${sd}`;
        }

        const card = document.getElementById("kinematic_one");
        const titleSpan = document.getElementById("kinematic-plane-title");
        const table = document.getElementById("kinematic-table-one");

        if (!card || !titleSpan || !table) return;
        card.style.display = "block";

        titleSpan.textContent = t(`kinematic.plane.${plane}`);

        const dataL = py.kinematic_L_meanstd;
        const dataR = py.kinematic_R_meanstd;
        if (!dataL || !dataR) return;

        const suffix = {
            sagittal: "Sag",
            frontal: "Front",
            transverse: "Trans"
        }[plane];

        const labelMap = {
            sagittal: {
                hip:   t("kinematic.flexext.hip"),
                knee:  t("kinematic.flexext.knee"),
                ankle: t("kinematic.flexext.ankle"),
            },
            frontal: {
                hip:   t("kinematic.abdadd.hip"),
                knee:  t("kinematic.abdadd.knee"),
                ankle: t("kinematic.abdadd.ankle"),
            },
            transverse: {
                hip:   t("kinematic.rotation.hip"),
                knee:  t("kinematic.rotation.knee"),
                ankle: t("kinematic.rotation.ankle"),
            }
        }[plane];

        const variables = [
            { base: "Flex max", label: "flex" },
            { base: "Index flex max", label: "index" },
            { base: "RoM", label: "rom" }
        ];

        let html = `
            <thead>
                <tr>
                    <th>${t("kinematic.column.parameter")}</th>
                    <th>${t("kinematic.column.left")}</th>
                    <th>${t("kinematic.column.right")}</th>
                </tr>
            </thead>
            <tbody>
        `;

        for (const joint of ["Hip", "Knee", "Ankle"]) {
            for (const v of variables) {
                const key = `${v.base} ${joint} ${suffix}`;
                const L = dataL[key];
                const R = dataR[key];
                if (!L || !R) continue;

                const rowLabel =
                    v.label === "flex"  ? labelMap[joint.toLowerCase()] :
                    v.label === "index" ? t(`kinematic.index.${joint.toLowerCase()}`) :
                                        t(`kinematic.rom.${joint.toLowerCase()}`);

                html += `
                    <tr>
                        <td class="kin-row-title">${rowLabel}</td>
                        <td>${formatValue(key, L)}</td>
                        <td>${formatValue(key, R)}</td>
                    </tr>
                `;
            }
        }

        html += `</tbody>`;
        table.innerHTML = html;
    }

    // ============================================================================
    //  KINEMATIC COMPARE — Tableau complet (avec BOLD + TRADUCTIONS)
    // ============================================================================
    function displayKinematic_compare(py1, py2, name1, name2, plane = "sagittal") {

        const table = document.getElementById("kinematic-compare-table");

        document.getElementById("kinematic-compare-title").textContent =
            t("kinematic.title").replace("{plane}", t(`kinematic.plane.${plane}`));

        document.getElementById("kinematic-compare-delta-info").textContent =
            t("compare.delta_info").replace("{e1}", name1).replace("{e2}", name2);

        // Δ coloration
        const deltaCell = (v1, v2) => {
            const d = (v2 - v1).toFixed(2);
            if (d > 0) return `<span class="val-better">+${d}</span>`;
            if (d < 0) return `<span class="val-worse">${d}</span>`;
            return `<span class="val-equal">0.00</span>`;
        };

        // BOLD si meilleure valeur
        const boldIfHigher = (mean, otherMean, text) => {
            return (mean >= otherMean)
                ? `<span class="pst-bold">${text}</span>`
                : text;
        };

        // Format valeur ± SD (et BOLD intelligent)
        const formatValue = (key, obj, objCompare) => {

            const m = Number(obj.mean.toFixed(2));
            const s = Number(obj.std.toFixed(2));
            const mc = Number(objCompare.mean.toFixed(2));

            const text = key.toLowerCase().includes("index")
                ? `${m}% ± ${s}`
                : `${m}° ± ${s}`;

            return boldIfHigher(m, mc, text);
        };

        const L1 = py1.kinematic_L_meanstd;
        const R1 = py1.kinematic_R_meanstd;
        const L2 = py2.kinematic_L_meanstd;
        const R2 = py2.kinematic_R_meanstd;

        const suffix = { sagittal:"Sag", frontal:"Front", transverse:"Trans" }[plane];

        const VARS = [
            ["Flex max", "flexext"],
            ["Index flex max", "index"],
            ["RoM", "rom"]
        ];

        const JOINTS = ["Hip", "Knee", "Ankle"];

        let html = `
            <tr>
                <th>${t("pst.header_param")}</th>
                <th>${t("pst.header_value")}</th>
                <th>${name1}</th>
                <th>${name2}</th>
                <th>Δ</th>
            </tr>
        `;

        for (const joint of JOINTS) {
            const jointKey = joint.toLowerCase();

            for (const [base, map] of VARS) {

                const key = `${base} ${joint} ${suffix}`;

                const l1 = L1[key];
                const l2 = L2[key];
                const r1 = R1[key];
                const r2 = R2[key];

                if (!l1 || !l2 || !r1 || !r2) continue;

                const label = t(`kinematic.${map}.${jointKey}`);

                html += `
                    <tr>
                        <td rowspan="2"><strong>${label}</strong></td>

                        <td class="pst-left-label">${t("pst.left")}</td>
                        <td>${formatValue(base, l1, l2)}</td>
                        <td>${formatValue(base, l2, l1)}</td>
                        <td>${deltaCell(l1.mean, l2.mean)}</td>
                    </tr>

                    <tr>
                        <td class="pst-right-label">${t("pst.right")}</td>
                        <td>${formatValue(base, r1, r2)}</td>
                        <td>${formatValue(base, r2, r1)}</td>
                        <td>${deltaCell(r1.mean, r2.mean)}</td>
                    </tr>
                `;
            }
        }

        table.innerHTML = html;
    }

});