/* FLAVORBOOK RECIPE DETAIL CONTROLLER */

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('recipe-detail-container');
  if (!container) return; // Exit if not on recipe detail page

  // Parse ID from URL parameters
  const params = new URLSearchParams(window.location.search);
  const recipeId = Number(params.get('id'));

  if (!recipeId) {
    window.location.href = '404.html';
    return;
  }

  // Load database
  fetch('data/recipes.json')
    .then(res => res.json())
    .then(recipes => {
      const recipe = recipes.find(r => r.id === recipeId);
      if (!recipe) {
        window.location.href = '404.html';
        return;
      }

      populateRecipeDetail(recipe);
      renderRelatedRecipes(recipe, recipes);
    })
    .catch(err => {
      console.error('Error loading recipe details:', err);
      container.innerHTML = `<div class="error-state"><p>Unable to load recipe details. Please try again.</p></div>`;
    });

  // Populate HTML templates with recipe details
  function populateRecipeDetail(recipe) {
    // 1. Header Details
    document.title = `${recipe.title} – FlavorBook`;
    document.getElementById('recipe-title').innerText = recipe.title;
    document.getElementById('recipe-desc').innerText = recipe.description;
    document.getElementById('recipe-category').innerText = recipe.category;
    document.getElementById('recipe-cuisine').innerText = recipe.cuisine;
    document.getElementById('recipe-image').src = recipe.image;
    document.getElementById('recipe-image').alt = recipe.title;
    document.getElementById('recipe-rating').innerHTML = `<i class="fa-solid fa-star"></i> ${recipe.rating.toFixed(1)} (${recipe.reviewsCount} Reviews)`;
    document.getElementById('recipe-time').innerText = `${recipe.prepTime + recipe.cookTime} Mins`;
    document.getElementById('recipe-servings').innerText = `${recipe.servings} Servings`;
    document.getElementById('recipe-calories').innerText = `${recipe.calories} kcal`;

    // Favorites button binding
    const favBtn = document.getElementById('recipe-fav-btn');
    favBtn.setAttribute('data-id', recipe.id);
    favBtn.setAttribute('data-title', recipe.title);
    
    if (typeof isFavorite === 'function' && isFavorite(recipe.id)) {
      favBtn.classList.add('active');
      favBtn.innerHTML = `<i class="fa-solid fa-heart"></i> Saved to Favorites`;
    } else {
      favBtn.classList.remove('active');
      favBtn.innerHTML = `<i class="fa-regular fa-heart"></i> Save to Favorites`;
    }

    favBtn.addEventListener('click', () => {
      if (typeof toggleFavorite === 'function') {
        const added = toggleFavorite(recipe.id, recipe.title);
        if (added) {
          favBtn.classList.add('active');
          favBtn.innerHTML = `<i class="fa-solid fa-heart"></i> Saved to Favorites`;
        } else {
          favBtn.classList.remove('active');
          favBtn.innerHTML = `<i class="fa-regular fa-heart"></i> Save to Favorites`;
        }
      }
    });

    // Share & Print button bindings
    document.getElementById('recipe-print-btn').addEventListener('click', () => {
      window.print();
    });

    document.getElementById('recipe-share-btn').addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href)
        .then(() => showToast('Link copied to clipboard!', 'success'))
        .catch(() => showToast('Could not copy link.', 'info'));
    });

    // 2. Ingredients List Builder
    const ingredientsList = document.getElementById('ingredients-list');
    ingredientsList.innerHTML = '';
    recipe.ingredients.forEach((ing, index) => {
      const li = document.createElement('li');
      li.style.display = 'flex';
      li.style.gap = '12px';
      li.style.alignItems = 'center';
      li.style.marginBottom = '12px';
      li.innerHTML = `
        <input type="checkbox" id="ing-${index}" class="ingredient-checkbox" style="width:20px; height:20px; accent-color:var(--primary-color); cursor:pointer;">
        <label for="ing-${index}" class="ingredient-label" style="font-size:1.05rem; cursor:pointer; transition:color 0.2s, text-decoration 0.2s;">${ing}</label>
      `;
      ingredientsList.appendChild(li);
    });

    // Strikeout completed ingredients
    document.querySelectorAll('.ingredient-checkbox').forEach(box => {
      box.addEventListener('change', (e) => {
        const label = e.target.nextElementSibling;
        if (e.target.checked) {
          label.style.textDecoration = 'line-through';
          label.style.color = 'var(--text-light)';
          // Bounce effect on label
          label.style.transform = 'scale(1.02)';
          setTimeout(() => label.style.transform = 'scale(1)', 150);
        } else {
          label.style.textDecoration = 'none';
          label.style.color = 'var(--text-color)';
        }
      });
    });

    // 3. Instructions Checklist & Progress Tracker
    const instructionsList = document.getElementById('instructions-list');
    instructionsList.innerHTML = '';
    
    recipe.instructions.forEach((inst, index) => {
      const stepCard = document.createElement('div');
      stepCard.className = `step-card reveal-fade-up ${index === 0 ? 'active' : ''}`;
      stepCard.id = `step-card-${index}`;
      stepCard.style.cssText = `
        border: 1px solid var(--border-color);
        background-color: var(--card-bg);
        border-radius: 15px;
        padding: 24px;
        margin-bottom: 20px;
        display: grid;
        grid-template-columns: 80px 1fr;
        gap: 20px;
        align-items: center;
        transition: border-color var(--transition-fast), background-color var(--transition-fast);
      `;
      stepCard.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center;">
          <span style="font-size:1.8rem; font-weight:800; color:var(--primary-color);">0${inst.step}</span>
          <input type="checkbox" class="step-checkbox" data-index="${index}" style="width:20px; height:20px; accent-color:var(--accent-color); margin-top:8px; cursor:pointer;">
        </div>
        <div style="display: grid; grid-template-columns: 1fr 120px; gap: 20px; align-items: center;">
          <div>
            <h4 style="font-size:1.15rem; margin-bottom:8px; color:var(--dark-color);">${inst.title}</h4>
            <p style="font-size:0.95rem; color:var(--text-color);">${inst.description}</p>
          </div>
          <img src="${inst.image}" alt="${inst.title}" style="width:100%; height:80px; object-fit:cover; border-radius:10px;">
        </div>
      `;
      instructionsList.appendChild(stepCard);
    });

    // Update active highlight and progress bar
    const stepCheckboxes = document.querySelectorAll('.step-checkbox');
    const stepsProgressBar = document.getElementById('steps-progress-bar');
    const stepsProgressText = document.getElementById('steps-progress-text');
    
    function updateStepsProgress() {
      const totalSteps = stepCheckboxes.length;
      let completedSteps = 0;
      
      stepCheckboxes.forEach((box, idx) => {
        const card = document.getElementById(`step-card-${idx}`);
        if (box.checked) {
          completedSteps++;
          card.classList.remove('active');
          card.style.opacity = '0.7';
        } else {
          card.style.opacity = '1';
        }
      });

      const percentage = Math.round((completedSteps / totalSteps) * 100);
      if (stepsProgressBar) stepsProgressBar.style.width = `${percentage}%`;
      if (stepsProgressText) stepsProgressText.innerText = `${percentage}% Completed`;
      
      // Highlight the first incomplete card
      let highlighted = false;
      stepCheckboxes.forEach((box, idx) => {
        const card = document.getElementById(`step-card-${idx}`);
        card.classList.remove('active');
        if (!box.checked && !highlighted) {
          card.classList.add('active');
          highlighted = true;
        }
      });
    }

    stepCheckboxes.forEach(box => {
      box.addEventListener('change', updateStepsProgress);
    });

    // 4. Nutrition Chart Animation
    const proteinBar = document.getElementById('protein-bar');
    const fatBar = document.getElementById('fat-bar');
    const carbsBar = document.getElementById('carbs-bar');

    document.getElementById('protein-val').innerText = `${recipe.nutrition.protein}g`;
    document.getElementById('fat-val').innerText = `${recipe.nutrition.fat}g`;
    document.getElementById('carbs-val').innerText = `${recipe.nutrition.carbs}g`;

    // Compute relative widths based on total weight
    const totalNutrition = recipe.nutrition.protein + recipe.nutrition.fat + recipe.nutrition.carbs;
    setTimeout(() => {
      proteinBar.style.width = `${(recipe.nutrition.protein / totalNutrition) * 100}%`;
      fatBar.style.width = `${(recipe.nutrition.fat / totalNutrition) * 100}%`;
      carbsBar.style.width = `${(recipe.nutrition.carbs / totalNutrition) * 100}%`;
    }, 500);

    // 5. Video Tutorial Embed
    const videoIframe = document.getElementById('recipe-video-iframe');
    if (recipe.youtubeUrl) {
      videoIframe.src = recipe.youtubeUrl;
    } else {
      document.querySelector('.video-section').style.display = 'none';
    }

    // 6. Comments System (Mock Submissions & Reactions)
    const commentForm = document.getElementById('comment-form');
    const commentsList = document.getElementById('comments-feed');
    
    if (commentForm && commentsList) {
      commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('comment-name').value.trim();
        const body = document.getElementById('comment-body').value.trim();

        if (name && body) {
          const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const commentEl = document.createElement('div');
          commentEl.className = 'comment-box';
          commentEl.style.cssText = 'border: 1px solid var(--border-color); background-color: var(--card-bg); border-radius: 12px; padding: 20px; margin-bottom: 15px;';
          commentEl.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
              <h4 style="color:var(--dark-color); font-weight:700;">${name}</h4>
              <span style="font-size:0.8rem; color:var(--text-light);">${date}</span>
            </div>
            <p style="font-size:0.95rem; color:var(--text-color);">${body}</p>
          `;
          
          commentsList.insertBefore(commentEl, commentsList.firstChild);
          
          document.getElementById('comment-name').value = '';
          document.getElementById('comment-body').value = '';
          showToast('Comment submitted!', 'success');
        }
      });
    }

    // Emoji reaction buttons count incrementor
    document.querySelectorAll('.reaction-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const badge = btn.querySelector('.reaction-count');
        let count = Number(badge.innerText);
        badge.innerText = count + 1;
        btn.classList.add('heart-beat');
        setTimeout(() => btn.classList.remove('heart-beat'), 800);
      });
    });
  }

  // 7. Render 4 Related Recipes (from same category or random fallback)
  function renderRelatedRecipes(current, allRecipes) {
    const list = document.getElementById('related-recipes-list');
    if (!list) return;

    list.innerHTML = '';
    
    // Filter matching category, skip currently displayed recipe
    let related = allRecipes.filter(r => r.category === current.category && r.id !== current.id);
    
    // Fallback if not enough matching category
    if (related.length < 4) {
      const remaining = allRecipes.filter(r => r.id !== current.id && !related.includes(r));
      related = [...related, ...remaining];
    }

    // Slice to exactly 4 items
    related.slice(0, 4).forEach(recipe => {
      const totalTime = recipe.prepTime + recipe.cookTime;
      const card = document.createElement('div');
      card.className = 'recipe-card reveal-fade-up';
      card.innerHTML = `
        <div class="card-img-wrapper">
          <img src="${recipe.image}" alt="${recipe.title}">
        </div>
        <div class="card-content">
          <h3 class="card-title" style="font-size:1.1rem; margin-bottom:8px;">
            <a href="recipe.html?id=${recipe.id}">${recipe.title}</a>
          </h3>
          <div class="card-footer" style="padding-top:10px; border-top:none;">
            <span><i class="fa-regular fa-clock"></i> ${totalTime} Min</span>
            <span><i class="fa-solid fa-star" style="color:var(--secondary-color);"></i> ${recipe.rating.toFixed(1)}</span>
          </div>
        </div>
      `;
      list.appendChild(card);
    });
  }
});
