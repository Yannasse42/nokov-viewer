// ============================================================================
//   ELECTRON — MAIN PROCESS
//   Version optimisée + commentée (aucun changement fonctionnel)
// ============================================================================

// ============================================================================
// 1) IMPORTS & CONSTANTES
// ============================================================================
const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const { modeles, correction_factor } = require("./src/modeles");
const { readHTR, readTRC } = require("./src/readers");

const SETTINGS_PATH = path.join(app.getPath("userData"), "settings.json");



// =============================
// 🔒 Empêcher plusieurs instances
// =============================
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();   // ❌ Une autre instance tourne déjà → on ferme celle-ci
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    // 👉 Si l’utilisateur relance l'app alors qu’elle tourne déjà :
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();  // 🔎 On remet la fenêtre existante au premier plan
    }
  });
}

// ============================================================================
// 2) GESTION DES SETTINGS (langue…)
// ============================================================================
let appSettings = { lang: "fr" };

// Charger paramètres
function loadSettings() {
  if (!fs.existsSync(SETTINGS_PATH)) return;

  try {
    const data = JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf-8"));
    appSettings = { ...appSettings, ...data };
  } catch (err) {
    console.warn("⚠ Impossible de charger settings.json :", err);
  }
}

// Sauvegarder paramètres
function saveSettings() {
  try {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(appSettings, null, 2));
  } catch (err) {
    console.warn("⚠ Impossible d’enregistrer settings.json :", err);
  }
}



// ============================================================================
// 3) MENU AVEC SÉLECTEUR DE LANGUE
// ============================================================================
function buildMenu(win) {

  const template = [
    // ---------------- FILE ----------------
    {
      label: "File",
      submenu: [
        { role: "quit", label: "Quit" }
      ]
    },

    // ---------------- LANGUAGE ----------------
    {
      label: "Language",
      submenu: [
        {
          label: "🇫🇷 Français (FR)",
          type: "radio",
          checked: appSettings.lang === "fr",
          click: () => updateLanguage("fr", win)
        },
        {
          label: "🇬🇧 English (EN)",
          type: "radio",
          checked: appSettings.lang === "en",
          click: () => updateLanguage("en", win)
        },
        {
          label: "🇨🇳 中文 (ZH)",
          type: "radio",
          checked: appSettings.lang === "zh",
          click: () => updateLanguage("zh", win)
        }
      ]
    },

    // ---------------- HELP ----------------
    {
      label: "Help",
      submenu: [
        {
          label: "About",
          click: () => openAboutWindow()
        },
        { label: "Reload", role: "reload" },
        { label: "Developer Tools", role: "toggledevtools" }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}


// Appliquer langue + enregistrer + MAJ menu
function updateLanguage(lang, win) {
  appSettings.lang = lang;
  saveSettings();
  win.webContents.send("set-language", lang);
  buildMenu(win);
}

const iconPath = app.isPackaged
  ? path.join(process.resourcesPath, "icon.ico")
  : path.join(__dirname, "src", "images", "nokov_viewer.ico");


function openAboutWindow() {
  const aboutWin = new BrowserWindow({
    width: 520,
    height: 600,
    resizable: false,
    minimizable: false,
    maximizable: false,
    titleBarStyle: "default",
    autoHideMenuBar: true,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  aboutWin.loadFile(path.join(__dirname, "about.html"));
}
// ============================================================================
// 4) CRÉATION DE LA FENÊTRE
// ============================================================================
function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    icon: iconPath,   // 👈 OBLIGATOIRE pour avoir l’icone dans npm start et en build
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  win.loadFile("src/index.html");

  win.webContents.on("did-finish-load", () => {
    win.webContents.send("set-language", appSettings.lang);
    buildMenu(win);
  });
}




// ============================================================================
// 5) APP READY
// ============================================================================
app.whenReady().then(() => {
  loadSettings();
  createWindow();

  // macOS : recréer fenêtre si dock cliqué
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0)
      createWindow();
  });
});


// Quitter app si toutes les fenêtres sont fermées (sauf mac)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});



// ============================================================================
// 6) IPC — CHOISIR DOSSIER
// ============================================================================
ipcMain.handle("select-folder", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"]
  });

  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});



// ============================================================================
// 7) IPC — DÉTECTION FICHIERS HTR/TRC
// ============================================================================
ipcMain.handle("detect-files", async (_, folderPath) => {
  try {
    const files = await fs.promises.readdir(folderPath);

    const htr = files.find(f => f.toLowerCase().endsWith(".htr"));
    const trc = files.find(f => f.toLowerCase().endsWith(".trc"));

    return {
      htr: htr ? path.join(folderPath, htr) : null,
      trc: trc ? path.join(folderPath, trc) : null
    };

  } catch (err) {
    console.error("Erreur lecture dossier:", err);
    return { htr: null, trc: null, error: err.message };
  }
});



// ============================================================================
// 8) IPC — DÉTECTION AUTOMATIQUE DU MODÈLE (CGM / ELEN HAYES)
// ============================================================================
ipcMain.handle("detect-model", async (_, trcPath) => {
  try {
    const content = await fs.promises.readFile(trcPath, "utf8");

    if (content.includes("X23") || content.includes("X24")) return "cgm23";
    if (content.includes("X8") || content.includes("X9")) return "elenhayes";

    return "unknown";

  } catch (err) {
    console.error("Erreur lecture TRC:", err);
    return "unknown";
  }
});



// ============================================================================
// 9) IPC — Lecture brute HTR / TRC
// ============================================================================
ipcMain.handle("read-htr", (_, p) => readHTR(p));
ipcMain.handle("read-trc", (_, p) => readTRC(p));



// ============================================================================
// 10) IPC — EXECUTION PYTHON (analyse.py)
// ============================================================================
function getPythonScriptPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "src", "analyse.py");
  } else {
    return path.join(__dirname, "src", "analyse.py");
  }
}

function getPythonExecutable() {
  // Si tu veux embarquer python.exe : on modifie ici
  return process.platform ==="darwin" ? "python3" : "python";
}

ipcMain.handle("run-python", async (_, args) => {
  return new Promise((resolve, reject) => {

    const scriptPath = getPythonScriptPath();
    const pythonExec = getPythonExecutable();

    console.log("RUN PY:", pythonExec, scriptPath);

    const py = spawn(pythonExec, [scriptPath, JSON.stringify(args)], {
      windowsHide: true
    });

    let stdout = "";

    py.stdout.on("data", data => stdout += data.toString());
    py.stderr.on("data", data => console.error("[PYTHON ERR]:", data.toString()));

    py.on("close", () => {
      if (!stdout.trim()) return reject("Python n’a rien renvoyé.");

      try { resolve(JSON.parse(stdout)); }
      catch (e) {
        console.log("RAW PYTHON:", stdout);
        reject("JSON invalide.");
      }
    });
  });
});

// ============================================================================
// 11) IPC — Vérifier si dossier existe
// ============================================================================
ipcMain.handle("folder-exists", (_, p) => {
  try {
    return fs.existsSync(p) && fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
});



