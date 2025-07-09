const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { Moon } = require('lunarphase-js');
const fs = require('fs');
const { Notification } = require('electron');

let entriesDir;

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
  const userDataPath = app.getPath("userData");
  const entriesDir = path.join(userDataPath, "entries");

  if (!fs.existsSync(entriesDir)) {
    fs.mkdirSync(entriesDir, { recursive: true });
  }

  createWindow();
});

// 🌕 Handle request for a full lunar cycle

function findLastFullMoon(startDate = new Date()) {
  let date = new Date(startDate);
  for (let i = 0; i < 30; i++) {
    date.setDate(date.getDate() - 1);
    if (Moon.lunarPhase(date) === "Full Moon") {
      return new Date(date);
    }
  }
  return null;
}

function findNextFullMoon(startDate = new Date()) {
  let date = new Date(startDate);
  for (let i = 0; i < 30; i++) {
    date.setDate(date.getDate() + 1);
    if (Moon.lunarPhase(date) === "Full Moon") {
      return new Date(date);
    }
  }
  return null;
}

function generateMoonToMoonCycle(startDate, endDate) {
  const days = [];
  let date = new Date(startDate);
  while (date <= endDate) {
    const key = date.toISOString().split('T')[0];
    const phase = Moon.lunarPhase(date);
    const emoji = getPhaseEmoji(phase);
    const age = Math.round(Moon.lunarAge(date));

    days.push({ date: key, phase, emoji, age });
    date.setDate(date.getDate() + 1);
  }
  return days;
}

function generateFixedCycle(startDate, length = 30) {
  const days = [];
  for (let i = 0; i < length; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const key = date.toISOString().split('T')[0];
    const phase = Moon.lunarPhase(date);
    const emoji = getPhaseEmoji(phase);
    const age = Math.round(Moon.lunarAge(date));

    days.push({ date: key, phase, emoji, age });
  }
  return days;
}

function getPhaseEmoji(phaseName) {
  const emojiMap = {
    "New Moon": "🌑",
    "Waxing Crescent": "🌒",
    "First Quarter": "🌓",
    "Waxing Gibbous": "🌔",
    "Full Moon": "🌕",
    "Waning Gibbous": "🌖",
    "Last Quarter": "🌗",
    "Waning Crescent": "🌘"
  };
  return emojiMap[phaseName] || "🌑";
}

ipcMain.handle('get-lunar-cycle', (event, startDateStr) => {
  const startDate = new Date(startDateStr);

  const lastFull = findLastFullMoon(startDate);
  const nextFull = findNextFullMoon(startDate);

  if (!lastFull || !nextFull) {
    console.warn("⚠️ Could not find full moon range. Falling back to 30-day cycle.");
    return generateFixedCycle(startDate, 30);
  }

  const cycleStart = new Date(lastFull);
  cycleStart.setDate(cycleStart.getDate() + 1); // start the day after the last full moon

  return generateMoonToMoonCycle(cycleStart, nextFull);
});

ipcMain.handle('get-moon-phase', () => {
  return {
    phase: Moon.lunarPhase(),
    emoji: Moon.lunarPhaseEmoji()
  };
});

ipcMain.handle("save-entry", async (_, date, content) => {
  try {
    const filename = `${date}.txt`;
    fs.writeFileSync(path.join(entriesDir, filename), content, "utf-8");
    return "Entry saved!";
  } catch (err) {
    console.error("Error saving entry", err);
    return "Failed to save entry";
  }
});

ipcMain.on("open-entry-window", (event, content) => {
  const entryWin = new BrowserWindow({
    width: 400,
    height: 400,
    title: "Journal Entry",
    parent: BrowserWindow.getFocusedWindow(),
    modal: true,
    webPreferences: {
      contextIsolation: true,
    },
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Entry</title>
        <style>
          body {
            font-family: sans-serif;
            padding: 20px;
            white-space: pre-wrap;
            background: #111;
            color: #eee;
          }
        </style>
      </head>
      <body>${content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</body>
    </html>
  `;

  entryWin.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(htmlContent));
});

ipcMain.handle("show-notification", (_, title, body) => {
  new Notification({ title, body }).show();
});

ipcMain.handle("load-entries", () => {
  try {
    return fs.readdirSync(entriesDir).map((file) => {
      const content = fs.readFileSync(path.join(entriesDir, file), "utf-8");
      return content;
    });
  } catch (err) {
    console.error("Error loading entries", err);
    return [];
  }
});