
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

      // ✨ Add glow to title + subtitle
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

  // Start spiral after title fades in
  setTimeout(() => {
      star.style.position = 'absolute';
      animateSpiral();
    }, 1500);
  });


// Display today's date
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

/*
// control panel stuff
document.addEventListener('DOMContentLoaded', () => {
  const soundToggle = document.getElementById('sound-toggle');
  const themeToggle = document.getElementById('theme-toggle');
  const soundPanel = document.getElementById('sound-panel');
  const themePanel = document.getElementById('theme-panel');

  const rainAudio = new Audio('assets/sounds/rain.mp3');
  const sparkleAudio = new Audio('assets/sounds/sparkles.mp3');
  const deltaAudio = new Audio('assets/sounds/delta.mp3');

  rainAudio.loop = sparkleAudio.loop = deltaAudio.loop = true;
  rainAudio.volume = sparkleAudio.volume = deltaAudio.volume = 0.5;

  rainAudio.play();
  sparkleAudio.play();
  deltaAudio.play();

  document.getElementById('rain-volume').addEventListener('input', e => {
    rainAudio.volume = parseFloat(e.target.value);
  });

  document.getElementById('sparkle-volume').addEventListener('input', e => {
    sparkleAudio.volume = parseFloat(e.target.value);
  });

  document.getElementById('delta-volume').addEventListener('input', e => {
    deltaAudio.volume = parseFloat(e.target.value);
  });

  soundToggle.addEventListener('click', () => {
    soundPanel.classList.toggle('hidden');
    themePanel.classList.add('hidden');
  });

  themeToggle.addEventListener('click', () => {
    themePanel.classList.toggle('hidden');
    soundPanel.classList.add('hidden');
  });

  document.querySelectorAll('.theme-option').forEach(button => {
  button.addEventListener('click', () => {
    // Remove 'selected' from all buttons
    document.querySelectorAll('.theme-option').forEach(btn => {
      btn.classList.remove('selected');
    });

    // Add 'selected' to the clicked one
    button.classList.add('selected');

    // Apply the theme
    const theme = button.dataset.theme;
    document.body.setAttribute('data-theme', theme);
  });
});
});
*/

// moon cycle shows

document.addEventListener('DOMContentLoaded', async () => {
  const today = new Date();
  const rawDays = await window.lunar.getCycle(today.toISOString());

  const days = rawDays.map(day => ({
    ...day,
    hasEntry: !!localStorage.getItem(`entry-${day.date}`),
    entry: localStorage.getItem(`entry-${day.date}`) || ""
  }));

  const phases = groupByPhase(days);
  renderMoonRing(phases);

  document.getElementById('view-cycle').addEventListener('click', () => {
    document.getElementById('main-app').classList.add('hidden');
    document.getElementById('cycle-view').classList.add('active');
  });

  document.getElementById('back-to-main').addEventListener('click', () => {
    document.getElementById('cycle-view').classList.remove('active');
    document.getElementById('main-app').classList.remove('hidden');
  });
});

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
      hasEntry: !!localStorage.getItem(`entry-${key}`),
      entry: localStorage.getItem(`entry-${key}`) || ""
    });
  }
  return days;
}

function groupByPhase(days) {
  const phaseMap = {};
  days.forEach(day => {
    if (!phaseMap[day.phase]) {
      phaseMap[day.phase] = {
        name: day.phase,
        emoji: day.emoji,
        days: []
      };
    }
    phaseMap[day.phase].days.push(day);
  });
  return Object.values(phaseMap);
}

function renderMoonRing(phases) {
  const ring = document.getElementById('moon-ring');
  ring.innerHTML = '';

  const centerLabel = document.createElement('div');
  centerLabel.id = 'cycle-range';
  centerLabel.className = 'cycle-center-label';
  centerLabel.textContent = `${phases[0].days[0].date} – ${phases.at(-1).days.at(-1).date}`;
  ring.appendChild(centerLabel);

  const radius = 150;
  const center = 200;

  phases.forEach((phase, i) => {
    const angle = (i / phases.length) * 2 * Math.PI - Math.PI/2;
    const x = center + radius * Math.cos(angle) - 25;
    const y = center + radius * Math.sin(angle) - 25;

    const moon = document.createElement('div');
    moon.className = 'moon-phase';
    moon.textContent = phase.emoji;
    moon.style.left = `${x}px`;
    moon.style.top = `${y}px`;
    moon.title = phase.name;

    if (phase.days.some(d => isToday(d.date))) {
      moon.classList.add('current');
    }

    moon.onclick = () => showPhaseDetails(phase, x + 25, y + 25, angle);
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
  const container = document.querySelector('.mini-moons');
  container.innerHTML = '';
  container.style.position = 'absolute';
  container.style.left = '0';
  container.style.top = '0';

  const radius = 80;
  const baseAngle = angleFromCenter; // angle from center to clicked moon

  phase.days.forEach((day, i, arr) => {
    const spread = Math.PI; // 180° arc
    const offset = spread * (i / (arr.length - 1)) - spread / 2;
    const angle = baseAngle + offset;

    const x = originX + radius * Math.cos(angle) ;
    const y = originY + radius * Math.sin(angle) ;

    const mini = document.createElement('div');
    mini.className = 'mini-moon';
    if (day.hasEntry) mini.classList.add('glow');
    mini.style.left = `${x}px`;
    mini.style.top = `${y}px`;
    mini.title = day.date;

    mini.onclick = () => {
      document.getElementById('entry-date').textContent = day.date;
      document.getElementById('entry-text').value = day.entry || "(no entry)";
    };

    container.appendChild(mini);
  });

  document.querySelector('.phase-dates').textContent = `${phase.days[0].date} – ${phase.days.at(-1).date}`;
  document.getElementById('phase-details').classList.remove('hidden');
}

function isToday(dateStr) {
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
}