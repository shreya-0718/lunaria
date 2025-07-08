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


// moon cycle shows
async function fetchLunarCycle(year, month) {
  const res = await fetch(`https://moon-api.com/api/moonphases?year=${year}&month=${month}&lat=33.2&lng=-96.6`, {
    headers: {
      'X-RapidAPI-Key': 'YOUR_API_KEY',
      'X-RapidAPI-Host': 'moon-api.com'
    }
  });

  const data = await res.json();
  return structureLunarCycle(data);
}

function structureLunarCycle(apiData) {
  const phases = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"];
  const grouped = [];

  for (let i = 0; i < phases.length; i++) {
    const start = new Date(apiData[i].date);
    const end = new Date(apiData[i + 1]?.date || start);
    const days = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0];
      days.push({
        date: key,
        hasEntry: !!localStorage.getItem(`entry-${key}`),
        entry: localStorage.getItem(`entry-${key}`) || ""
      });
    }

    grouped.push({
      name: apiData[i].phase,
      start: start.toDateString(),
      end: end.toDateString(),
      isCurrent: isTodayInRange(start, end),
      days
    });
  }

  return {
    start: new Date(apiData[0].date).toDateString(),
    end: new Date(apiData[apiData.length - 1].date).toDateString(),
    phases: grouped
  };
}

function isTodayInRange(start, end) {
  const today = new Date();
  return today >= start && today <= end;
}

let currentCycleIndex = 0;

function updateCycleView() {
  const cycle = lunarCycles[currentCycleIndex]; // precomputed array of cycles
  document.getElementById('cycle-range').textContent = `${cycle.start} – ${cycle.end}`;
  renderMoonRing(cycle.phases);
}

function renderMoonRing(phases) {
  const ring = document.getElementById('moon-ring');
  ring.innerHTML = '';
  const radius = 150;
  const center = 200;

  phases.forEach((phase, i) => {
    const angle = (i / phases.length) * 2 * Math.PI;
    const x = center + radius * Math.cos(angle) - 25;
    const y = center + radius * Math.sin(angle) - 25;

    const moon = document.createElement('div');
    moon.className = 'moon-phase';
    if (phase.isCurrent) moon.classList.add('current');
    moon.style.left = `${x}px`;
    moon.style.top = `${y}px`;
    moon.title = phase.name;

    moon.onclick = () => showPhaseDetails(phase);
    ring.appendChild(moon);
  });
}

function showPhaseDetails(phase) {
  const container = document.querySelector('.mini-moons');
  container.innerHTML = '';
  const radius = 100;
  const centerX = 150;
  const centerY = 150;

  phase.days.forEach((day, i, arr) => {
    const angle = Math.PI * (i / (arr.length - 1)); // semi-circle
    const x = centerX + radius * Math.cos(angle) - 15;
    const y = centerY + radius * Math.sin(angle) - 15;

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

  document.querySelector('.phase-dates').textContent = `${phase.start} – ${phase.end}`;
  document.getElementById('phase-details').classList.remove('hidden');
}

let lunarCycles = [];

document.addEventListener('DOMContentLoaded', async () => {
  const today = new Date();
  const cycle = await fetchLunarCycle(today.getFullYear(), today.getMonth() + 1);
  lunarCycles.push(cycle);
  updateCycleView();

  document.getElementById('prev-phase').onclick = () => {
    if (currentCycleIndex > 0) {
      currentCycleIndex -= 1;
      updateCycleView();
    }
  };

  document.getElementById('next-phase').onclick = () => {
    if (currentCycleIndex < lunarCycles.length - 1) {
      currentCycleIndex += 1;
      updateCycleView();
    }
  };

  document.getElementById('view-cycle').addEventListener('click', () => {
    document.getElementById('main-app').classList.add('hidden');
    document.getElementById('cycle-view').classList.add('active');
    updateCycleView();
  });

  document.getElementById('back-to-main').addEventListener('click', () => {
    document.getElementById('cycle-view').classList.remove('active');
    document.getElementById('main-app').classList.remove('hidden');
  });
});