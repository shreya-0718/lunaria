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

contextBridge.exposeInMainWorld('journalAPI', {
  save: (date, content) => ipcRenderer.invoke('save-entry', date, content),
  load: () => ipcRenderer.invoke('load-entries'),
  openEntry: (content) => ipcRenderer.send("open-entry-window", content),
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body),
});


// ctrl + shift + i opens dev tools on electron