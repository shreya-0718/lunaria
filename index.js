const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { Moon } = require('lunarphase-js');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile('index.html');
};

app.whenReady().then(() => {
  createWindow();
});

// 🌓 Handle moon phase request from renderer
ipcMain.handle('get-moon-phase', () => {
  return {
    phase: Moon.lunarPhase(),
    emoji: Moon.lunarPhaseEmoji()
  };
});