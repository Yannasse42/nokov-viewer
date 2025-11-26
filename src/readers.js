const fs = require("fs");
const { modeles } = require("./modeles");

// =======================================================
// =============== LECTEUR HTR ===========================
// =======================================================

function readHTR(
    path,
    segments = ["R.Thigh", "L.Thigh", "R.Shank", "L.Shank", "L.Foot", "R.Foot"],
    rot = true,
    trans = false
) {
    if (!rot && !trans) {
        throw new Error("Au moins rot ou trans doit être vrai.");
    }

    let keeped_columns;
    if (rot && trans) keeped_columns = ["Tx", "Ty", "Tz", "Rx", "Ry", "Rz"];
    else if (rot) keeped_columns = ["Rx", "Ry", "Rz"];
    else keeped_columns = ["Tx", "Ty", "Tz"];

    const content = fs.readFileSync(path, "utf8");
    const parts = content.split("[");
    let blocks = parts.filter(p => segments.some(seg => p.includes(seg)));
    blocks = blocks.slice(2);

    let result = {};

    for (let block of blocks) {
        let name = block.split("]")[0].trim().replace(/\./g, "_");

        let lines = block.split("\n").slice(1);
        lines = lines.map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length < 2) continue;

        let header = lines[0].trim().split(/\s+|\t+/).map(h => h.trim());
        let colIndex = keeped_columns.map(col => header.indexOf(col));

        if (colIndex.some(i => i === -1)) {
            console.warn("⚠ Colonnes manquantes pour", name);
            continue;
        }

        let rows = [];

        for (let i = 1; i < lines.length; i++) {
            let values = lines[i].split(/\s+|\t+/);
            let obj = {};

            keeped_columns.forEach((col, j) => {
                obj[col] = parseFloat(values[colIndex[j]]);
            });

            rows.push(obj);
        }

        result[name] = rows;
    }

    return result;
}


// =======================================================
// =============== LECTEUR HTR ===========================
// =======================================================

function readHTR(
    path,
    segments = ["R.Thigh", "L.Thigh", "R.Shank", "L.Shank", "L.Foot", "R.Foot"],
    rot = true,
    trans = false
) {
    if (!rot && !trans) {
        throw new Error("Au moins rot ou trans doit être vrai.");
    }

    let keeped_columns;
    if (rot && trans) keeped_columns = ["Tx", "Ty", "Tz", "Rx", "Ry", "Rz"];
    else if (rot) keeped_columns = ["Rx", "Ry", "Rz"];
    else keeped_columns = ["Tx", "Ty", "Tz"];

    const content = fs.readFileSync(path, "utf8");
    const parts = content.split("[");
    let blocks = parts.filter(p => segments.some(seg => p.includes(seg)));
    blocks = blocks.slice(2);

    let result = {};

    for (let block of blocks) {
        let name = block.split("]")[0].trim().replace(/\./g, "_");

        let lines = block.split("\n").slice(1);
        lines = lines.map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length < 2) continue;

        let header = lines[0].trim().split(/\s+|\t+/).map(h => h.trim());
        let colIndex = keeped_columns.map(col => header.indexOf(col));

        if (colIndex.some(i => i === -1)) {
            console.warn("⚠ Colonnes manquantes pour", name);
            continue;
        }

        let rows = [];

        for (let i = 1; i < lines.length; i++) {
            let values = lines[i].split(/\s+|\t+/);
            let obj = {};

            keeped_columns.forEach((col, j) => {
                obj[col] = parseFloat(values[colIndex[j]]);
            });

            rows.push(obj);
        }

        result[name] = rows;
    }

    return result;
}

// =======================================================
// =============== LECTEUR TRC ===========================
// =======================================================

function readTRC(path) {
    console.log("\n=== readTRC() fichier :", path);

    const raw = fs.readFileSync(path, "utf8");
    const lines = raw.split(/\r?\n/).filter(l => l.trim().length);

    // Ligne header brut (colonnes XYZ)
    const xyzHeader = lines[4].trim().split(/\s+/);
    console.log("=== xyzHeader brut ===");
    console.log(xyzHeader);

    //---------------------------------------------------------
    // 🔥 Correction : rendre TOUS les noms uniques
    //---------------------------------------------------------
    const seen = {};
    const uniqueHeader = xyzHeader.map(name => {
        if (!seen[name]) {
            seen[name] = 1;
            return name;             // première occurrence : X1
        } else {
            const newName = `${name}.${seen[name]}`; // X1.1, X1.2...
            seen[name]++;
            return newName;
        }
    });

    console.log("=== xyzHeader unique ===");
    console.log(uniqueHeader);

    // Création header complet
    let header = ["Frame", "Time", "Timestamp", ...uniqueHeader];
    console.log("=== HEADER COMPLET (avant coupe) ===");
    console.log(header);

    //---------------------------------------------------------
    // 🔥 Coupe après les doublons → EXACTEMENT 104 colonnes
    //---------------------------------------------------------
    const MAX_COLS = 104;
    header = header.slice(0, MAX_COLS);

    console.log(`=== HEADER APRES COUPE (104 colonnes) ===`);
    console.log(header);

    //---------------------------------------------------------
    // Lecture des données
    //---------------------------------------------------------
    const rows = lines.slice(5).map(line => {
        const cols = line.trim().split(/\s+/);
        const obj = {};

        header.forEach((h, i) => {
            const val = parseFloat(cols[i]);
            obj[h] = Number.isNaN(val) ? null : val;
        });

        return obj;
    });

    console.log("----- TRC FINAL -----");
    console.log("Nb lignes :", rows.length);
    console.log("Nb colonnes :", header.length);
    console.log("Exemple ligne 1 :", rows[0]);

    return { header, rows };
}

// =======================================================
// =============== MARKERSET ==============================
// =======================================================

function markerSet(model_used, trcData, modeles_bank = modeles) {
    console.log("\n==================== markerSet() ====================");
    console.log("➡️ Modèle utilisé :", model_used);

    const model = modeles_bank[model_used];

    if (!model) {
        console.warn("❌ Modèle inconnu dans markerSet :", model_used);
        return {};
    }

    console.log("➡️ Nombre de marqueurs attendus :", Object.keys(model).length);

    let output = {};

    // Affichage du header TRC
    console.log("➡️ Header TRC :", trcData.header);
    console.log("➡️ Nb colonnes TRC :", trcData.header.length);

    for (let key of Object.keys(model)) {
        console.log(`\n--- 🔍 Marqueur : ${key} ---`);

        const [colX, colY, colZ] = model[key];
        console.log("   Colonnes attendues :", colX, colY, colZ);

        const iX = trcData.header.indexOf(colX);
        const iY = trcData.header.indexOf(colY);
        const iZ = trcData.header.indexOf(colZ);

        console.log("   ➡️ Index trouvés :", { iX, iY, iZ });

        if (iX === -1 || iY === -1 || iZ === -1) {
            console.warn(`   ❌ Colonnes introuvables pour ${key} :`, model[key]);

            // Rechercher toutes colonnes ressemblantes (debug avancé)
            const possibles = trcData.header.filter(h =>
                h.startsWith(colX.replace(/[0-9]/g, "")) ||
                h.startsWith(colY.replace(/[0-9]/g, "")) ||
                h.startsWith(colZ.replace(/[0-9]/g, ""))
            );

            console.warn("   🔎 Colonnes similaires trouvées :", possibles);

            output[key] = [];
            continue;
        }

        console.log(`   ✔ Colonnes OK. Extraction des données...`);

        output[key] = trcData.rows.map((row, idx) => ({
            X: row[colX],
            Y: row[colY],
            Z: row[colZ],
        }));

        // Affiche seulement la première ligne pour vérifier
        console.log("   Exemple donnée 1ère frame :", output[key][0]);
    }

    console.log("\n================ FIN markerSet() =====================\n");
    return output;
}


// =======================================================
// =============== EXPORTS ===============================
// =======================================================

module.exports = {
    readHTR,
    readTRC,
};
