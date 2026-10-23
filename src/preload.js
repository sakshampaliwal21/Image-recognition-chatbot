const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("imageAI", {
    ask: (data) => ipcRenderer.invoke("ask-image", data)
});

