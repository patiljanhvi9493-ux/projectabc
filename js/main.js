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

  // 8. UPDATE AUTHENTICATION UI
  updateAuthUI();

  // 9. INITIALIZE HERO SLIDER
  initHeroSlider();
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

function updateAuthUI() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const navMenus = document.querySelectorAll('.nav-menu');
  
  navMenus.forEach(menu => {
    // Look for Login link in header menu
    const loginLink = menu.querySelector('a[href="login.html"]');
    if (loginLink) {
      if (isLoggedIn) {
        loginLink.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i> Logout';
        loginLink.href = '#';
        loginLink.classList.add('logout-trigger');
        loginLink.onclick = (e) => {
          e.preventDefault();
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('userEmail');
          showToast('Logged out successfully!', 'info');
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 1000);
        };
      } else {
        loginLink.innerHTML = 'Login';
        loginLink.href = 'login.html';
        loginLink.classList.remove('logout-trigger');
        loginLink.onclick = null;
      }
    }
  });

  // Also replace footer link
  const footerLinks = document.querySelectorAll('.footer-links a[href="login.html"]');
  footerLinks.forEach(link => {
    if (isLoggedIn) {
      link.innerHTML = 'Logout';
      link.href = '#';
      link.onclick = (e) => {
        e.preventDefault();
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        showToast('Logged out successfully!', 'info');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      };
    } else {
      link.innerHTML = 'Login Portal';
      link.href = 'login.html';
      link.onclick = null;
    }
  });
}

function initHeroSlider() {
  const slider = document.querySelector('.hero-slider');
  if (!slider) return;
  const slides = slider.querySelectorAll('.slide');
  if (slides.length <= 1) return;
  
  let currentSlide = 0;
  setInterval(() => {
    // Fade out current slide
    slides[currentSlide].classList.remove('active');
    
    // Increment slide index
    currentSlide = (currentSlide + 1) % slides.length;
    
    // Fade in next slide
    slides[currentSlide].classList.add('active');
  }, 3500);
}
// --- QUICK INFO MODAL LOGIC ---
let recipesDataCache = null;

async function getRecipesData() {
  if (recipesDataCache) return recipesDataCache;
  try {
    const response = await fetch('data/recipes.json');
    recipesDataCache = await response.json();
    return recipesDataCache;
  } catch (error) {
    console.error('Error loading recipes data:', error);
    return [];
  }
}

async function openQuickInfoModal(recipeId) {
  const recipes = await getRecipesData();
  const recipe = recipes.find(r => r.id === parseInt(recipeId));
  if (!recipe) return;
  
  let modal = document.getElementById('quick-info-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'quick-info-modal';
    modal.className = 'quick-info-modal';
    modal.innerHTML = `
      <div class="quick-info-backdrop"></div>
      <div class="quick-info-container">
        <div class="quick-info-header">
          <div class="quick-info-header-overlay"></div>
          <button class="quick-info-close-btn"><i class="fa-solid fa-xmark"></i></button>
          <div class="quick-info-title-wrap">
            <span class="quick-info-tag" id="q-tag">Category</span>
            <h3 class="quick-info-title" id="q-title">Recipe Title</h3>
          </div>
        </div>
        <div class="quick-info-body">
          <p class="quick-info-desc" id="q-desc">Recipe description...</p>
          <div class="quick-info-stats-grid">
            <div class="quick-info-stat-card">
              <i class="fa-solid fa-fire quick-info-stat-icon"></i>
              <span class="quick-info-stat-val" id="q-calories">300 kcal</span>
              <span class="quick-info-stat-label">Calories</span>
            </div>
            <div class="quick-info-stat-card">
              <i class="fa-regular fa-clock quick-info-stat-icon"></i>
              <span class="quick-info-stat-val" id="q-time">30 Min</span>
              <span class="quick-info-stat-label">Total Time</span>
            </div>
            <div class="quick-info-stat-card">
              <i class="fa-solid fa-chart-line quick-info-stat-icon"></i>
              <span class="quick-info-stat-val" id="q-difficulty">Medium</span>
              <span class="quick-info-stat-label">Difficulty</span>
            </div>
          </div>
          <div class="quick-info-actions">
            <a href="#" class="quick-info-primary-btn" id="q-view-btn">
              <i class="fa-solid fa-utensils"></i> View Full Recipe
            </a>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    modal.querySelector('.quick-info-close-btn').addEventListener('click', () => {
      modal.classList.remove('active');
    });
    modal.querySelector('.quick-info-backdrop').addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }
  
  modal.querySelector('.quick-info-header').style.backgroundImage = `url('${recipe.image}')`;
  modal.querySelector('#q-tag').textContent = recipe.category;
  modal.querySelector('#q-title').textContent = recipe.title;
  modal.querySelector('#q-desc').textContent = recipe.description;
  modal.querySelector('#q-calories').textContent = `${recipe.calories} kcal`;
  modal.querySelector('#q-time').textContent = `${recipe.prepTime + recipe.cookTime} Min`;
  modal.querySelector('#q-difficulty').textContent = recipe.difficulty;
  
  const viewBtn = modal.querySelector('#q-view-btn');
  viewBtn.href = `recipe.html?id=${recipe.id}`;
  
  modal.classList.add('active');
}

// Global click delegation for recipe image clicks
document.addEventListener('click', (e) => {
  const img = e.target.closest('.card-img-wrapper img');
  if (img) {
    const card = img.closest('.recipe-card');
    if (card) {
      let recipeId = null;
      const favBtn = card.querySelector('.card-fav-btn');
      
      if (favBtn) {
        recipeId = favBtn.getAttribute('data-id');
      } else {
        const titleLink = card.querySelector('.card-title a');
        if (titleLink) {
          const href = titleLink.getAttribute('href');
          const match = href.match(/id=(\d+)/);
          if (match) {
            recipeId = match[1];
          }
        }
      }
      
      if (recipeId) {
        e.preventDefault();
        e.stopPropagation();
        openQuickInfoModal(recipeId);
      }
    }
  }
});
