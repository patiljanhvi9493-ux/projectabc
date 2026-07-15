/* FLAVORBOOK SEARCH CONTROLLER */

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('global-search-input');
  const searchBtn = document.getElementById('global-search-btn');
  const searchOverlay = document.querySelector('.search-overlay');
  
  if (!searchInput) return;

  function performSearch() {
    const query = searchInput.value.trim();
    if (query) {
      // Hide search overlay if visible
      if (searchOverlay) {
        searchOverlay.classList.remove('active');
      }
      // Redirect to recipes search page
      window.location.href = `recipes.html?search=${encodeURIComponent(query)}`;
    }
  }

  // Handle enter key press
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });

  // Handle click on submit button
  if (searchBtn) {
    searchBtn.addEventListener('click', performSearch);
  }

  // Handle autocomplete/suggestions container if present
  const suggestionsBox = document.getElementById('search-suggestions');
  if (suggestionsBox) {
    searchInput.addEventListener('input', async () => {
      const query = searchInput.value.trim().toLowerCase();
      suggestionsBox.innerHTML = '';
      
      if (query.length < 2) {
        suggestionsBox.style.display = 'none';
        return;
      }

      try {
        const response = await fetch('data/recipes.json');
        const recipes = await response.json();
        
        const filtered = recipes.filter(recipe => 
          recipe.title.toLowerCase().includes(query) ||
          recipe.category.toLowerCase().includes(query)
        ).slice(0, 5); // Max 5 suggestions

        if (filtered.length > 0) {
          suggestionsBox.style.display = 'block';
          filtered.forEach(recipe => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.innerHTML = `<i class="fa-solid fa-utensils"></i> <span>${recipe.title}</span>`;
            item.addEventListener('click', () => {
              window.location.href = `recipe.html?id=${recipe.id}`;
            });
            suggestionsBox.appendChild(item);
          });
        } else {
          suggestionsBox.style.display = 'none';
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      }
    });
  }
});
