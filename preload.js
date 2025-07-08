console.log("✅ preload.js loaded");

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lunar', {
  getCycle: async (startDate) => {
    return await ipcRenderer.invoke('get-lunar-cycle', startDate);
  },

  getPhase: async () => {
    const result = await ipcRenderer.invoke('get-moon-phase');
    return result;
  } 
});

// ctrl + shift + i opens dev tools on electron