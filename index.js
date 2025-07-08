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

// 🌕 Handle request for a full lunar cycle
ipcMain.handle('get-lunar-cycle', (event, startDateStr) => {
  const startDate = new Date(startDateStr);
  const days = [];

  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const key = date.toISOString().split('T')[0];
    days.push({
      date: key,
      phase: Moon.lunarPhase(date),
      emoji: Moon.lunarPhaseEmoji(date),
      age: Moon.lunarAge(date),
    });
  }

  return days;
});

ipcMain.handle('get-moon-phase', () => {
  return {
    phase: Moon.lunarPhase(),
    emoji: Moon.lunarPhaseEmoji()
  };
});