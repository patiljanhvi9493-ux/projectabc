/* FLAVORBOOK CORE CLIENT SCRIPT */

// Global toast alert helper
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const icon = type === 'success' ? 'fa-circle-check' : type === 'info' ? 'fa-circle-info' : 'fa-circle-exclamation';
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Remove toast after duration
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s forwards cubic-bezier(0.25, 0.8, 0.25, 1)';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}

document.addEventListener('DOMContentLoaded', () => {
  
  // 1. SIMULATED LOADING SCREEN
  const loader = document.getElementById('loading-screen');
  const progressBar = document.querySelector('.progress-bar');
  const percentageLabel = document.querySelector('.loading-percentage');
  
  if (loader && progressBar && percentageLabel) {
    let progress = 0;
    const intervalTime = 15; // total loading time approx 1.5s
    const loadingInterval = setInterval(() => {
      progress += 1;
      progressBar.style.width = `${progress}%`;
      percentageLabel.innerText = `${progress}%`;
      
      if (progress >= 100) {
        clearInterval(loadingInterval);
        setTimeout(() => {
          loader.style.opacity = '0';
          loader.style.visibility = 'hidden';
          document.body.style.overflowY = 'auto'; // allow scroll
        }, 300);
      }
    }, intervalTime);
  } else {
    // Enable scroll immediately if loader is not present
    document.body.style.overflowY = 'auto';
  }

  // 2. STICKY HEADER SCROLL
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 3. RESPONSIVE MOBILE NAVIGATION DRAWER
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close menu when clicking navigation link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }

  // 4. FLOATING SEARCH OVERLAY
  const searchTrigger = document.querySelector('.search-trigger');
  const searchOverlay = document.querySelector('.search-overlay');
  const searchClose = document.querySelector('.search-close');
  
  if (searchTrigger && searchOverlay && searchClose) {
    searchTrigger.addEventListener('click', () => {
      searchOverlay.classList.add('active');
      document.getElementById('global-search-input').focus();
    });

    searchClose.addEventListener('click', () => {
      searchOverlay.classList.remove('active');
    });

    searchOverlay.addEventListener('click', (e) => {
      if (e.target === searchOverlay) {
        searchOverlay.classList.remove('active');
      }
    });
  }

  // 5. BACK-TO-TOP BUTTON
  const backToTopBtn = document.querySelector('.back-to-top');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        backToTopBtn.classList.add('active');
      } else {
        backToTopBtn.classList.remove('active');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 6. NEWSLETTER SUBSCRIPTION FORM VALIDATION
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector('input[type="email"]');
      const email = emailInput.value.trim();

      if (email && validateEmail(email)) {
        showToast('Thanks for subscribing! Check your inbox for sweet recipes.', 'success');
        emailInput.value = '';
      } else {
        showToast('Please enter a valid email address.', 'info');
      }
    });
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // 7. TRACK RECENTLY VIEWED RECIPES
  const params = new URLSearchParams(window.location.search);
  const currentRecipeId = params.get('id');
  if (currentRecipeId && window.location.pathname.includes('recipe.html')) {
    saveRecentRecipe(currentRecipeId);
  }
});

function saveRecentRecipe(id) {
  const RECENT_KEY = 'flavorbook_recent';
  let recent = localStorage.getItem(RECENT_KEY) ? JSON.parse(localStorage.getItem(RECENT_KEY)) : [];
  id = Number(id);
  
  // Remove duplicate if it exists and push to front
  recent = recent.filter(item => item !== id);
  recent.unshift(id);
  
  // Keep only the 4 most recent recipes
  recent = recent.slice(0, 4);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
}
