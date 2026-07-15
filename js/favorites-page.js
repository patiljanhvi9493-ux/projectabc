/* FLAVORBOOK FAVORITES PAGE CONTROLLER */

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('favorites-page-grid');
  if (!grid) return; // Exit if not on favorites page

  function renderFavoritesPage() {
    grid.style.opacity = '0';
    grid.style.transform = 'translateY(15px)';

    setTimeout(() => {
      fetch('data/recipes.json')
        .then(res => res.json())
        .then(recipes => {
          const favoriteIds = typeof getFavorites === 'function' ? getFavorites() : [];
          const favRecipes = recipes.filter(recipe => favoriteIds.includes(recipe.id));

          grid.innerHTML = '';
          grid.style.opacity = '1';
          grid.style.transform = 'translateY(0)';

          if (favRecipes.length === 0) {
            grid.innerHTML = `
              <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 80px 20px;">
                <i class="fa-regular fa-heart" style="font-size: 4.5rem; color: var(--primary-color); margin-bottom: 20px; display: inline-block; opacity: 0.5;"></i>
                <h3 style="font-size: 1.6rem; margin-bottom: 12px; color: var(--dark-color);">No Recipes Saved Yet</h3>
                <p style="color: var(--text-light); max-width: 400px; margin: 0 auto 30px auto;">Browse our collection of delicious recipe guides and tap the heart icon on any card to save it here!</p>
                <a href="recipes.html" class="btn btn-primary">Explore Recipes <i class="fa-solid fa-arrow-right"></i></a>
              </div>
            `;
            return;
          }

          favRecipes.forEach(recipe => {
            const totalTime = recipe.prepTime + recipe.cookTime;
            const card = document.createElement('div');
            card.className = 'recipe-card';
            card.id = `fav-card-${recipe.id}`;
            card.style.transition = 'transform 0.4s ease, opacity 0.4s ease, max-height 0.4s ease, margin-bottom 0.4s ease, padding 0.4s ease';
            card.innerHTML = `
              <div class="card-img-wrapper">
                <span class="card-tag">${recipe.category}</span>
                <button class="card-fav-btn active" data-id="${recipe.id}" data-title="${recipe.title}">
                  <i class="fa-solid fa-heart"></i>
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

          // Bind custom removal transition on click
          bindRemovalAnimations();
        })
        .catch(err => {
          console.error('Error fetching recipes for favorites:', err);
          grid.innerHTML = `<div class="error-state"><p>Unable to load favorites. Please try again.</p></div>`;
        });
    }, 200);
  }

  function bindRemovalAnimations() {
    const favButtons = grid.querySelectorAll('.card-fav-btn');
    favButtons.forEach(btn => {
      // Overwrite default listener with a custom page transition
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const recipeId = Number(btn.getAttribute('data-id'));
        const recipeTitle = btn.getAttribute('data-title') || 'Recipe';
        const card = document.getElementById(`fav-card-${recipeId}`);

        // Toggle favoriting state
        if (typeof toggleFavorite === 'function') {
          toggleFavorite(recipeId, recipeTitle);
        }

        if (card) {
          // Trigger smooth slide out collapse
          card.style.opacity = '0';
          card.style.transform = 'scale(0.8) translateY(-20px)';
          
          setTimeout(() => {
            card.remove();
            
            // Check if grid is now empty
            if (grid.children.length === 0) {
              renderFavoritesPage();
            }
          }, 400);
        }
      });
    });
  }

  // Initial load
  renderFavoritesPage();
});
