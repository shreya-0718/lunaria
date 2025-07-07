console.log("✅ preload.js loaded");

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lunar', {
  getPhase: async () => {
    const result = await ipcRenderer.invoke('get-moon-phase');
    return result;
  }
});

// ctrl + shift + i opens dev tools on electron