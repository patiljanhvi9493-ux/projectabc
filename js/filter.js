/* FLAVORBOOK FILTERING & CATALOG SYSTEM */

const ITEMS_PER_PAGE = 6;
let currentRecipes = [];
let filteredRecipes = [];
let currentPage = 1;

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('recipes-page-grid');
  if (!grid) return; // Exit if not on recipes page

  // Elements
  const searchInput = document.getElementById('recipe-search');
  const sortSelect = document.getElementById('sort-select');
  const difficultySelect = document.getElementById('difficulty-select');
  const timeSlider = document.getElementById('time-range');
  const timeVal = document.getElementById('time-val');
  const categoryFilters = document.querySelectorAll('.category-filter-btn');
  const paginationContainer = document.getElementById('pagination');

  let activeCategory = 'all';

  // Load recipes database
  fetch('data/recipes.json')
    .then(res => res.json())
    .then(staticRecipes => {
      const userRecipesData = localStorage.getItem('flavorbook_user_recipes');
      const userRecipes = userRecipesData ? JSON.parse(userRecipesData) : [];
      currentRecipes = [...userRecipes, ...staticRecipes];
      filteredRecipes = [...currentRecipes];
      
      // Sync URL parameters on landing
      syncURLParams();

      // Apply initial filters
      applyFilters();
    })
    .catch(err => {
      console.error('Error loading recipe catalog:', err);
      grid.innerHTML = `<div class="error-state"><i class="fa-solid fa-triangle-exclamation"></i><p>Unable to load recipes. Please try again.</p></div>`;
    });

  // Sync URL parameters (e.g. from homepage search or category cards)
  function syncURLParams() {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get('search');
    const categoryParam = params.get('category');

    if (searchParam && searchInput) {
      searchInput.value = searchParam;
    }
    
    if (categoryParam) {
      activeCategory = categoryParam;
      categoryFilters.forEach(btn => {
        if (btn.getAttribute('data-category').toLowerCase() === categoryParam.toLowerCase()) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }
  }

  // Filter application
  function applyFilters() {
    grid.style.opacity = '0';
    grid.style.transform = 'translateY(15px)';

    setTimeout(() => {
      let result = [...currentRecipes];

      // Search Query Filter
      if (searchInput) {
        const query = searchInput.value.toLowerCase().trim();
        if (query) {
          result = result.filter(recipe => 
            recipe.title.toLowerCase().includes(query) ||
            recipe.description.toLowerCase().includes(query) ||
            recipe.ingredients.some(ing => ing.toLowerCase().includes(query))
          );
        }
      }

      // Category filter
      if (activeCategory !== 'all') {
        result = result.filter(recipe => 
          recipe.category.toLowerCase() === activeCategory.toLowerCase()
        );
      }

      // Difficulty level filter
      if (difficultySelect) {
        const difficulty = difficultySelect.value;
        if (difficulty !== 'all') {
          result = result.filter(recipe => 
            recipe.difficulty.toLowerCase() === difficulty.toLowerCase()
          );
        }
      }

      // Max Cook Time filter
      if (timeSlider) {
        const maxTime = Number(timeSlider.value);
        if (maxTime < 120) { // Assume 120 means "no limit"
          result = result.filter(recipe => recipe.prepTime + recipe.cookTime <= maxTime);
        }
      }

      // Sort results
      if (sortSelect) {
        const sortBy = sortSelect.value;
        if (sortBy === 'rating') {
          result.sort((a, b) => b.rating - a.rating);
        } else if (sortBy === 'popular') {
          result.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
        } else if (sortBy === 'newest') {
          result.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        }
      }

      filteredRecipes = result;
      currentPage = 1;
      renderGrid();
      
      grid.style.opacity = '1';
      grid.style.transform = 'translateY(0)';
    }, 300);
  }

  // Grid renderer
  function renderGrid() {
    grid.innerHTML = '';
    
    if (filteredRecipes.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-cookie-bite"></i>
          <h3>No Recipes Found</h3>
          <p>Try clearing some filters or searching for something else!</p>
        </div>
      `;
      if (paginationContainer) paginationContainer.innerHTML = '';
      return;
    }

    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIdx = startIdx + ITEMS_PER_PAGE;
    const pageRecipes = filteredRecipes.slice(startIdx, endIdx);

    pageRecipes.forEach(recipe => {
      const isFav = typeof isFavorite === 'function' ? isFavorite(recipe.id) : false;
      const totalTime = recipe.prepTime + recipe.cookTime;
      const card = document.createElement('div');
      card.className = 'recipe-card';
      card.innerHTML = `
        <div class="card-img-wrapper">
          <span class="card-tag">${recipe.category}</span>
          <button class="card-fav-btn ${isFav ? 'active' : ''}" data-id="${recipe.id}" data-title="${recipe.title}">
            <i class="${isFav ? 'fa-solid fas' : 'fa-regular far'} fa-heart"></i>
          </button>
          <img src="${recipe.image}" alt="${recipe.title}">
        </div>
        <div class="card-content">
          <div class="card-meta">
            <span class="card-rating">
              <i class="fa-solid fa-star"></i> ${recipe.rating.toFixed(1)}
            </span>
            <span class="card-difficulty">${recipe.difficulty}</span>
          </div>
          <h3 class="card-title">
            <a href="recipe.html?id=${recipe.id}">${recipe.title}</a>
          </h3>
          <p class="card-desc">${recipe.description}</p>
          <div class="card-footer">
            <span><i class="fa-regular fa-clock"></i> ${totalTime} Min</span>
            <span><i class="fa-solid fa-fire"></i> ${recipe.calories} kcal</span>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    // Reinitialize favorite click listeners
    if (typeof initFavoriteButtons === 'function') {
      initFavoriteButtons();
    }

    renderPagination();
  }

  // Pagination Builder
  function renderPagination() {
    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(filteredRecipes.length / ITEMS_PER_PAGE);
    if (totalPages <= 1) return;

    // Previous Button
    const prevBtn = document.createElement('button');
    prevBtn.className = `page-btn ${currentPage === 1 ? 'disabled' : ''}`;
    prevBtn.innerHTML = `<i class="fa-solid fa-chevron-left"></i>`;
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderGrid();
        window.scrollTo({ top: grid.offsetTop - 100, behavior: 'smooth' });
      }
    });
    paginationContainer.appendChild(prevBtn);

    // Number Buttons
    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = document.createElement('button');
      pageBtn.className = `page-btn ${currentPage === i ? 'active' : ''}`;
      pageBtn.innerText = i;
      pageBtn.addEventListener('click', () => {
        currentPage = i;
        renderGrid();
        window.scrollTo({ top: grid.offsetTop - 100, behavior: 'smooth' });
      });
      paginationContainer.appendChild(pageBtn);
    }

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.className = `page-btn ${currentPage === totalPages ? 'disabled' : ''}`;
    nextBtn.innerHTML = `<i class="fa-solid fa-chevron-right"></i>`;
    nextBtn.addEventListener('click', () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderGrid();
        window.scrollTo({ top: grid.offsetTop - 100, behavior: 'smooth' });
      }
    });
    paginationContainer.appendChild(nextBtn);
  }

  // Event Listeners for controls
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }
  if (sortSelect) {
    sortSelect.addEventListener('change', applyFilters);
  }
  if (difficultySelect) {
    difficultySelect.addEventListener('change', applyFilters);
  }
  if (timeSlider) {
    timeSlider.addEventListener('input', () => {
      const val = timeSlider.value;
      if (val >= 120) {
        timeVal.innerText = 'Any Time';
      } else {
        timeVal.innerText = `${val} Min`;
      }
      applyFilters();
    });
  }

  // Category filter tabs
  categoryFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-category');
      applyFilters();
    });
  });
});
