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

      // Fade out intro
      setTimeout(() => {
        intro.style.opacity = '0';
        mainApp.style.display = 'block';
      }, 2000);

      setTimeout(() => {
        intro.style.display = 'none';
        mainApp.style.display = 'block';
        document.body.style.overflowY = 'auto';
      }, 4000);
    }
  }

  // Start spiral after title fades in
setTimeout(() => {
    star.style.position = 'absolute';
    animateSpiral();
  }, 1500);
});
