
// Intro star animation
window.addEventListener('DOMContentLoaded', () => {
  const star = document.getElementById('star');
  const dotTarget = document.getElementById('i-dot-target');
  const intro = document.getElementById('intro');
  const mainApp = document.getElementById('main-app');

  const targetRect = dotTarget.getBoundingClientRect();
  const targetX = targetRect.left + window.scrollX + 4.2;
  const targetY = targetRect.top + window.scrollY + 18;

  let angle = 0;
  let radius = 300;
  
  let currentAnchorDate = new Date(); // default to today
  
  function animateSpiral() {
    const targetRect = dotTarget.getBoundingClientRect();
    const targetX = targetRect.left + window.scrollX + 4.2;
    const targetY = targetRect.top + window.scrollY + 18;

    if (radius > 5) {
      const x = targetX + radius * Math.cos(angle);
      const y = targetY + radius * Math.sin(angle);

      star.style.left = `${x}px`;
      star.style.top = `${y}px`;

      angle += 0.2;
      radius *= 0.9;

      requestAnimationFrame(animateSpiral);
    } else {
      // Snap to final position
      star.style.left = `${targetX}px`;
      star.style.top = `${targetY}px`;
      star.classList.add('landed');

      // glow to title + subtitle
      const title = document.getElementById('title-text');
      const subtitle = document.getElementById('subtitle-text');

      // Remove any existing animation class
      title.classList.remove('glow-flash');
      subtitle.classList.remove('glow-flash');
      void title.offsetWidth;

      // Add the animation class
      title.classList.add('glow-flash');
      subtitle.classList.add('glow-flash');

      // Fade out intro
      setTimeout(() => {
        intro.style.opacity = '0';
        mainApp.style.display = 'block';
        document.getElementById('cycle-view').classList.add('hidden');
      }, 1500);
    }
  }

  // spiral after title fades in
  setTimeout(() => {
      star.style.position = 'absolute';
      animateSpiral();
    }, 1500);
  });


// display today's date
const today = new Date();
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
const formattedDate = today.toLocaleDateString(undefined, options);

document.getElementById('date-display').textContent = formattedDate;


document.addEventListener('DOMContentLoaded', async () => {
  console.log("📦 renderer.js loaded");

  if (!window.lunar) {
    console.error("🚫 window.lunar is undefined");
    return;
  }

  const { phase, emoji } = await window.lunar.getPhase();

  // side bar shows emoji + phase
  const moonIcon = document.getElementById('moon-icon');
  const moonLabel = document.getElementById('moon-label');

  if (moonIcon && moonLabel) {
    moonIcon.textContent = emoji;
    moonLabel.textContent = phase;
  }

  // footer only shows phase
  const moonFooter = document.getElementById('moon-phase');
  if (moonFooter) {
    moonFooter.textContent = `${phase}`;
    console.log("Footer:" + moonFooter.textContent);
  } else {
    console.error("🚫 #moon-phase element not found");
  }
});

// moon cycle shows:

function groupByPhase(days) {
  const phases = [];
  let current = {
    name: days[0].phase,
    emoji: days[0].emoji, 
    days: [days[0]]
  };

  for (let i = 1; i < days.length; i++) {
    const day = days[i];
    if (day.phase === current.name) {
      current.days.push(day);
    } else {
      phases.push(current);
      current = {
        name: day.phase,
        emoji: day.emoji,
        days: [day]
      };
    }
  }
  phases.push(current);

  if (phases.length > 1 && phases[0].name === phases.at(-1).name) {
    phases[0].days = [...phases.at(-1).days, ...phases[0].days];
    phases.pop();
  }

  return phases;
}

function isToday(dateStr) {
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
}

function generateLunarCycle(startDate = new Date()) {
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
      hasEntry: false,
      entry: ""
    });
  }
  return days;
}

function renderMoonRing(phases) {
  console.log("🌑 Rendering moon ring");
  console.log("Phases:", phases);

  const phaseEmojiMap = {
    "New Moon": "🌑",
    "Waxing Crescent": "🌒",
    "First Quarter": "🌓",
    "Waxing Gibbous": "🌔",
    "Full": "🌕",
    "Waning Gibbous": "🌖",
    "Last Quarter": "🌗",
    "Waning Crescent": "🌘"
  };

  const ring = document.getElementById('moon-ring');
  const miniMoons = ring.querySelector('.mini-moons');

  // Clear the ring but keep the mini moons container
  ring.innerHTML = '';
  ring.appendChild(miniMoons);

  // Add the center label
  const centerLabel = document.createElement('div');
  centerLabel.id = 'cycle-range';
  centerLabel.className = 'cycle-center-label';
  centerLabel.textContent = `${phases[0].days[0].date} – ${phases.at(-1).days.at(-1).date}`;
  ring.appendChild(centerLabel);

  const radius = 150;
  const center = 200;

  phases.forEach((phase, i) => {
    const angle = (i / phases.length) * 2 * Math.PI - Math.PI / 2;
    const x = center + radius * Math.cos(angle) - 25;
    const y = center + radius * Math.sin(angle) - 25;

    const moon = document.createElement('div');
    moon.className = 'moon-phase';
    moon.style.left = `${x}px`;
    moon.style.top = `${y}px`;
    moon.title = phase.name;

    // 🌕 Set the emoji
    moon.textContent = phaseEmojiMap[phase.name] || "🌑";

    if (phase.days.some(d => isToday(d.date))) {
      moon.classList.add('current');
    }

    moon.onclick = () => {
      const rect = moon.getBoundingClientRect();
      const ringRect = ring.getBoundingClientRect();

      const centerX = rect.left - ringRect.left + rect.width / 2;
      const centerY = rect.top - ringRect.top + rect.height / 2;

      showPhaseDetails(phase, centerX, centerY, angle);
    };

    ring.appendChild(moon);

    const label = document.createElement('div');
    label.className = 'phase-label';
    label.textContent = `${phase.days[0].date} – ${phase.days.at(-1).date}`;
    label.style.position = 'absolute';
    label.style.left = `${x}px`;
    label.style.top = `${y + 60}px`;
    label.style.width = '100px';
    label.style.textAlign = 'center';
    label.style.transform = 'translateX(-25%)';
    label.style.color = '#aaa';
    ring.appendChild(label);
  });
}

function showPhaseDetails(phase, originX, originY, angleFromCenter) {
  const container = document.querySelector('#moon-ring .mini-moons');

  if (!container) {
    console.error("❌ .mini-moons not found inside #moon-ring");
    return;
  }

  console.log("🌙 showPhaseDetails called for:", phase.name);

  container.innerHTML = '';
  container.style.position = 'absolute';
  container.style.left = '0';
  container.style.top = '0';

  const radius = 80;
  const spread = Math.PI;

  phase.days.forEach((day, i, arr) => {
    const offset = spread * (i / (arr.length - 1)) - spread / 2;
    const angle = angleFromCenter + offset;

    const x = originX + radius * Math.cos(angle);
    const y = originY + radius * Math.sin(angle);

    console.log(`🛰️ Mini moon ${i}:`, x, y, day.date, day.hasEntry);

    const mini = document.createElement('div');
    mini.className = 'mini-moon';
    if (day.hasEntry) mini.classList.add('glow');
    mini.style.left = `${x}px`;
    mini.style.top = `${y}px`;
    mini.title = day.date;

    mini.onclick = () => {
      if (day.entry) {
        console.log("🛰️ Opening entry modal for:", day.date);
        window.journalAPI.openEntry(day.entry);
      } else {
        document.getElementById('entry-date').textContent = day.date;
        document.getElementById('entry-date-in').textContent = day.date;
        document.getElementById('entry-text').value = "";
      }
    };

    container.appendChild(mini);
  });

  document.querySelector('.phase-dates').textContent = `${phase.days[0].date} – ${phase.days.at(-1).date}`;
  document.getElementById('phase-details').classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log("🌙 DOM fully loaded");

  const today = new Date();
  const rawDays = await window.lunar.getCycle(today.toISOString());
  
  const days = rawDays.map(day => ({
    ...day,
    hasEntry: false,
    entry: ""
  }));

  const phases = groupByPhase(days);

  const todayStr = new Date().toISOString().split('T')[0];

  const currentPhase = phases.find(phase =>
    phase.days.some(day => day.date === todayStr)
  );

  if (currentPhase) {
    const startDate = currentPhase.days[0].date;
    const endDate = currentPhase.days.at(-1).date;

    const formatDate = (iso) => {
      const date = new Date(iso);
      return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
    };

    const formatted = startDate === endDate
      ? formatDate(startDate)
      : `${formatDate(startDate)} – ${formatDate(endDate)}`;

    document.getElementById('phase-dates').textContent = formatted;
  }

  document.getElementById('export').addEventListener('click', async () => {
    const dateStr = document.getElementById('entry-date').textContent;
    const date = new Date(dateStr);
    const text = document.getElementById('entry-text').value;

    if (!date || !text.trim()) {
      window.journalAPI.showNotification("Export Failed", "No entry selected or entry is empty.");
      return;
    }

    const { phase, emoji } = await window.lunar.getPhase();

    const formattedDate = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    const exportText = `${emoji} ${phase} | 📅 ${formattedDate}\n\n${text}\n`;
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `lunaria-entry-${dateStr}.txt`;
    a.click();

    URL.revokeObjectURL(url);
  });

  // ✅ Load saved entries and merge them into the data
  const entries = await window.journalAPI.load();
  entries.forEach(entryStr => {
    const { date, text } = JSON.parse(entryStr);
    const phase = phases.find(p => p.days.some(d => d.date === date));
    if (phase) {
      const day = phase.days.find(d => d.date === date);
      day.entry = text;
      day.hasEntry = true;
    }
  });

  // ✅ Render the moon ring immediately
  renderMoonRing(phases);

  // ✅ Attach event listeners
  document.getElementById('view-cycle').addEventListener('click', () => {
    console.log("🌕 View Cycle button clicked");
    document.getElementById('main-app').classList.add('hidden');
    document.getElementById('main-app').classList.remove('active');
    document.getElementById('cycle-view').classList.remove('hidden');
    document.getElementById('cycle-view').classList.add('active');
  });

  document.getElementById('back-to-main').addEventListener('click', () => {
    console.log("🔙 Back to main clicked");
    document.getElementById('cycle-view').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    document.getElementById('main-app').classList.add('active');
    document.getElementById('cycle-view').classList.remove('active');
  });

  document.getElementById('save').addEventListener('click', async () => {
    const date = document.getElementById('entry-date').textContent;
    const text = document.getElementById('entry-text').value;

    if (!date || !text.trim()) {
      window.journalAPI.showNotification("Save Failed", "Please select a date and enter some text.");
      return;
    }

    const result = await window.journalAPI.save(date, text);
    window.journalAPI.showNotification("Saved", result);

    const phase = phases.find(p => p.days.some(d => d.date === date));
    if (phase) {
      const day = phase.days.find(d => d.date === date);
      day.entry = text;
      day.hasEntry = true;
    }

    renderMoonRing(phases);
  });
});