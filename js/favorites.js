/* FLAVORBOOK FAVORITES SYSTEM */

const FAVORITES_KEY = 'flavorbook_favorites';

function getFavorites() {
  const data = localStorage.getItem(FAVORITES_KEY);
  return data ? JSON.parse(data) : [];
}

function saveFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function isFavorite(id) {
  const favorites = getFavorites();
  return favorites.includes(Number(id));
}

function toggleFavorite(id, title = 'Recipe') {
  id = Number(id);
  let favorites = getFavorites();
  const index = favorites.indexOf(id);
  let added = false;

  if (index === -1) {
    favorites.push(id);
    added = true;
    showToast(`Added "${title}" to Favorites!`, 'success');
  } else {
    favorites.splice(index, 1);
    showToast(`Removed "${title}" from Favorites.`, 'info');
  }

  saveFavorites(favorites);
  
  // Custom event to update other components dynamically
  const event = new CustomEvent('favoritesUpdated', { detail: { id, added } });
  document.dispatchEvent(event);

  return added;
}

// Binds click handlers to elements matching a selector
function initFavoriteButtons() {
  const favBtns = document.querySelectorAll('.card-fav-btn, .action-fav-btn');
  
  favBtns.forEach(btn => {
    const recipeId = Number(btn.getAttribute('data-id'));
    const recipeTitle = btn.getAttribute('data-title') || 'Recipe';
    
    // Set initial visual state
    if (isFavorite(recipeId)) {
      btn.classList.add('active');
      const icon = btn.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-regular', 'far');
        icon.classList.add('fa-solid', 'fas');
      }
    } else {
      btn.classList.remove('active');
      const icon = btn.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-solid', 'fas');
        icon.classList.add('fa-regular', 'far');
      }
    }

    // Bind click trigger
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const added = toggleFavorite(recipeId, recipeTitle);
      
      if (added) {
        btn.classList.add('active');
        const icon = btn.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-regular', 'far');
          icon.classList.add('fa-solid', 'fas');
        }
        btn.classList.add('heart-beat');
        setTimeout(() => btn.classList.remove('heart-beat'), 800);
      } else {
        btn.classList.remove('active');
        const icon = btn.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-solid', 'fas');
          icon.classList.add('fa-regular', 'far');
        }
      }
    });
  });
}

// Listen to updates from other pages / cards to keep synchronized
document.addEventListener('favoritesUpdated', (e) => {
  const { id, added } = e.detail;
  const favBtns = document.querySelectorAll(`.card-fav-btn[data-id="${id}"], .action-fav-btn[data-id="${id}"]`);
  
  favBtns.forEach(btn => {
    if (added) {
      btn.classList.add('active');
      const icon = btn.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-regular', 'far');
        icon.classList.add('fa-solid', 'fas');
      }
    } else {
      btn.classList.remove('active');
      const icon = btn.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-solid', 'fas');
        icon.classList.add('fa-regular', 'far');
      }
    }
  });
});

// Run on load
document.addEventListener('DOMContentLoaded', initFavoriteButtons);
