const { contextBridge, ipcRenderer } = require("electron");
const path = require("path");

contextBridge.exposeInMainWorld("electronAPI", {
    selectFolder: () => ipcRenderer.invoke("select-folder"),
    detectFiles: (folder) => ipcRenderer.invoke("detect-files", folder),
    detectModel: (trcPath) => ipcRenderer.invoke("detect-model", trcPath),
    basename: (filePath) => path.basename(filePath),
    readHTR: (p) => ipcRenderer.invoke("read-htr", p),
    readTRC: (p) => ipcRenderer.invoke("read-trc", p),

    // 🔥 ajout
    runPython: (args) => ipcRenderer.invoke("run-python", args),

    folderExists: (path) => ipcRenderer.invoke("folder-exists", path),

    onSetLanguage: (callback) => ipcRenderer.on("set-language", callback),

    setMenuLanguage: (lang) => ipcRenderer.send("update-menu-language", lang),

});

