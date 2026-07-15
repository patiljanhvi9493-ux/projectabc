/* FLAVORBOOK DARK MODE CONTROLLER */

document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.querySelector('.theme-toggle');
  if (!themeToggle) return;

  const body = document.body;
  const toggleIcon = themeToggle.querySelector('i');

  // Check LocalStorage for saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    if (toggleIcon) {
      toggleIcon.classList.remove('fa-moon');
      toggleIcon.classList.add('fa-sun');
    }
  } else {
    body.classList.remove('dark-mode');
    if (toggleIcon) {
      toggleIcon.classList.remove('fa-sun');
      toggleIcon.classList.add('fa-moon');
    }
  }

  // Toggler event listener
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    // Add micro-rotation animation class
    themeToggle.style.transform = 'scale(1.1) rotate(360deg)';
    setTimeout(() => {
      themeToggle.style.transform = 'scale(1) rotate(0deg)';
    }, 500);

    if (body.classList.contains('dark-mode')) {
      localStorage.setItem('theme', 'dark');
      if (toggleIcon) {
        toggleIcon.classList.remove('fa-moon');
        toggleIcon.classList.add('fa-sun');
      }
      showToast('Dark mode enabled!', 'info');
    } else {
      localStorage.setItem('theme', 'light');
      if (toggleIcon) {
        toggleIcon.classList.remove('fa-sun');
        toggleIcon.classList.add('fa-moon');
      }
      showToast('Light mode enabled!', 'info');
    }
  });
});
