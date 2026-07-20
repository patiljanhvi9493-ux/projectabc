/* FLAVORBOOK PROFILE & RECIPE PUBLISHER CONTROLLER */

document.addEventListener('DOMContentLoaded', () => {
  // Ensure profile page exists
  const profileTabContent = document.getElementById('tab-published');
  if (!profileTabContent) return;

  // Global Cover Photo URL state
  let currentCoverUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

  // 1. Profile State & Initialization
  initUserProfile();
  initProfileTabs();
  initEditProfileModal();
  initCoverUploader();
  initDynamicRows();
  initPublishForm();
  renderPublishedRecipes();
  renderFavoritesRecipes();

  // -------------------------------------------------------------
  // USER PROFILE MANAGEMENT
  // -------------------------------------------------------------
  function getDefaultProfile() {
    const email = localStorage.getItem('userEmail') || 'alex.morgan@flavorbook.com';
    return {
      name: 'Chef Alex Morgan',
      handle: '@chef_alex',
      email: email,
      bio: 'Passionate culinary explorer & recipe creator 🍕 | Italian pasta craftsman, Asian fusion artisan & pastry perfectionist.',
      avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=300&q=80',
      joined: 'Member since 2024',
      badge: 'Master Chef 🌟'
    };
  }

  function getUserProfile() {
    const saved = localStorage.getItem('flavorbook_user_profile');
    if (saved) {
      try {
        return { ...getDefaultProfile(), ...JSON.parse(saved) };
      } catch (e) {
        return getDefaultProfile();
      }
    }
    return getDefaultProfile();
  }

  function saveUserProfile(profileData) {
    localStorage.setItem('flavorbook_user_profile', JSON.stringify(profileData));
    renderUserProfile(profileData);
  }

  function initUserProfile() {
    const profile = getUserProfile();
    renderUserProfile(profile);
  }

  function renderUserProfile(profile) {
    const nameEl = document.getElementById('display-user-name');
    const handleEl = document.getElementById('display-user-handle');
    const emailEl = document.getElementById('display-user-email');
    const bioEl = document.getElementById('display-user-bio');
    const avatarEl = document.getElementById('display-user-avatar');

    if (nameEl) nameEl.innerText = profile.name;
    if (handleEl) handleEl.innerHTML = `<i class="fa-solid fa-at"></i> ${profile.handle.replace('@', '')}`;
    if (emailEl) emailEl.innerHTML = `<i class="fa-solid fa-envelope"></i> ${profile.email}`;
    if (bioEl) bioEl.innerText = profile.bio;
    if (avatarEl && profile.avatar) avatarEl.src = profile.avatar;

    updateProfileStats();
  }

  function updateProfileStats() {
    const userRecipes = getUserRecipes();
    const publishedCountEl = document.getElementById('stat-published-count');
    const tabCountEl = document.getElementById('tab-recipe-count');
    if (publishedCountEl) publishedCountEl.innerText = userRecipes.length;
    if (tabCountEl) tabCountEl.innerText = userRecipes.length;

    const favorites = JSON.parse(localStorage.getItem('flavorbook_favorites') || '[]');
    const favoritesCountEl = document.getElementById('stat-favorites-count');
    if (favoritesCountEl) favoritesCountEl.innerText = favorites.length;
  }

  // -------------------------------------------------------------
  // TAB NAVIGATION & HASH HANDLING
  // -------------------------------------------------------------
  function initProfileTabs() {
    const tabBtns = document.querySelectorAll('.profile-tab-btn');
    const tabContents = document.querySelectorAll('.profile-tab-content');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-tab');

        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const targetContent = document.getElementById(targetId);
        if (targetContent) targetContent.classList.add('active');
      });
    });

    // Check URL Hash for tab selection
    const hash = window.location.hash;
    if (hash === '#publish') {
      const publishBtn = document.querySelector('.profile-tab-btn[data-tab="tab-publish"]');
      if (publishBtn) publishBtn.click();
    } else if (hash === '#favorites') {
      const favBtn = document.querySelector('.profile-tab-btn[data-tab="tab-favorites"]');
      if (favBtn) favBtn.click();
    }
  }

  // -------------------------------------------------------------
  // EDIT PROFILE MODAL LOGIC
  // -------------------------------------------------------------
  function initEditProfileModal() {
    const modal = document.getElementById('edit-profile-modal');
    const openBtn = document.getElementById('btn-open-edit-profile');
    const avatarEditBtn = document.getElementById('btn-edit-avatar-trigger');
    const closeBtn = document.getElementById('btn-close-edit-modal');
    const cancelBtn = document.getElementById('btn-cancel-edit-modal');
    const form = document.getElementById('edit-profile-form');

    if (!modal) return;

    function openModal() {
      const current = getUserProfile();
      document.getElementById('edit-name-input').value = current.name;
      document.getElementById('edit-handle-input').value = current.handle;
      document.getElementById('edit-email-input').value = current.email;
      document.getElementById('edit-bio-input').value = current.bio;
      document.getElementById('edit-avatar-input').value = current.avatar || '';
      modal.style.display = 'flex';
    }

    function closeModal() {
      modal.style.display = 'none';
    }

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (avatarEditBtn) avatarEditBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const updated = {
          ...getUserProfile(),
          name: document.getElementById('edit-name-input').value.trim(),
          handle: document.getElementById('edit-handle-input').value.trim(),
          email: document.getElementById('edit-email-input').value.trim(),
          bio: document.getElementById('edit-bio-input').value.trim(),
          avatar: document.getElementById('edit-avatar-input').value.trim() || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=300&q=80'
        };

        saveUserProfile(updated);
        closeModal();
        if (typeof showToast === 'function') {
          showToast('Profile updated successfully!', 'success');
        }
      });
    }
  }

  // -------------------------------------------------------------
  // COVER PHOTO UPLOADER & PRESET PICKER
  // -------------------------------------------------------------
  function initCoverUploader() {
    const fileInput = document.getElementById('cover-file-input');
    const urlInput = document.getElementById('cover-url-input');
    const previewImg = document.getElementById('cover-preview-img');
    const placeholderText = document.getElementById('cover-placeholder-text');
    const dropzone = document.getElementById('cover-dropzone');
    const presetThumbs = document.querySelectorAll('.preset-cover-thumb');

    function updatePreview(url) {
      if (!url) return;
      currentCoverUrl = url;
      if (previewImg) {
        previewImg.src = url;
        previewImg.style.display = 'block';
      }
      if (placeholderText) {
        placeholderText.style.display = 'none';
      }
    }

    // Default initial preview
    updatePreview(currentCoverUrl);

    // File Input Upload -> Base64
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            updatePreview(evt.target.result);
            if (typeof showToast === 'function') {
              showToast('Photo uploaded as recipe cover!', 'success');
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Direct Image URL
    if (urlInput) {
      urlInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val) {
          updatePreview(val);
        }
      });
    }

    // Preset Thumbnail Click
    presetThumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        presetThumbs.forEach(t => t.classList.remove('selected'));
        thumb.classList.add('selected');
        updatePreview(thumb.src);
        if (urlInput) urlInput.value = thumb.src;
      });
    });

    // Drag & Drop
    if (dropzone) {
      ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          dropzone.style.borderColor = '#ff4757';
          dropzone.style.background = 'rgba(255, 107, 107, 0.15)';
        }, false);
      });

      ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          dropzone.style.borderColor = 'var(--primary-color)';
          dropzone.style.background = 'rgba(255, 107, 107, 0.04)';
        }, false);
      });

      dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files[0]) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            updatePreview(evt.target.result);
            if (typeof showToast === 'function') {
              showToast('Cover photo dropped & ready!', 'success');
            }
          };
          reader.readAsDataURL(files[0]);
        }
      });
    }
  }

  // -------------------------------------------------------------
  // DYNAMIC INGREDIENTS & INSTRUCTIONS ROWS
  // -------------------------------------------------------------
  function initDynamicRows() {
    const ingredientsContainer = document.getElementById('ingredients-rows-container');
    const instructionsContainer = document.getElementById('instructions-rows-container');
    const addIngBtn = document.getElementById('btn-add-ingredient');
    const addInstBtn = document.getElementById('btn-add-instruction');

    // Add Ingredient Row
    window.addIngredientRow = function(val = '') {
      if (!ingredientsContainer) return;
      const row = document.createElement('div');
      row.className = 'dynamic-row ingredient-row';
      row.innerHTML = `
        <input type="text" class="glow-input ingredient-item-input" value="${val}" placeholder="e.g., 2 tbsp extra virgin olive oil" required style="padding: 12px; border-radius: 10px; border: 1px solid var(--border-color); background: var(--bg-color); color: var(--text-color);">
        <button type="button" class="btn-remove-row" title="Remove ingredient"><i class="fa-solid fa-trash-can"></i></button>
      `;
      row.querySelector('.btn-remove-row').addEventListener('click', () => row.remove());
      ingredientsContainer.appendChild(row);
    };

    // Add Instruction Step Row
    window.addInstructionRow = function(val = '') {
      if (!instructionsContainer) return;
      const stepNum = instructionsContainer.children.length + 1;
      const row = document.createElement('div');
      row.className = 'dynamic-row instruction-row';
      row.style.alignItems = 'flex-start';
      row.innerHTML = `
        <span class="step-num-badge" style="font-weight: 800; color: var(--primary-color); font-size: 1.1rem; min-width: 28px; padding-top: 10px;">${stepNum}.</span>
        <textarea class="glow-input instruction-step-input" rows="2" placeholder="Describe this cooking step in detail..." required style="padding: 12px; border-radius: 10px; border: 1px solid var(--border-color); background: var(--bg-color); color: var(--text-color); font-family: inherit; font-size: 0.95rem;">${val}</textarea>
        <button type="button" class="btn-remove-row" style="margin-top: 4px;" title="Remove step"><i class="fa-solid fa-trash-can"></i></button>
      `;
      row.querySelector('.btn-remove-row').addEventListener('click', () => {
        row.remove();
        reindexStepNumbers();
      });
      instructionsContainer.appendChild(row);
    };

    function reindexStepNumbers() {
      if (!instructionsContainer) return;
      const rows = instructionsContainer.querySelectorAll('.instruction-row');
      rows.forEach((r, idx) => {
        const badge = r.querySelector('.step-num-badge');
        if (badge) badge.innerText = `${idx + 1}.`;
      });
    }

    if (addIngBtn) addIngBtn.addEventListener('click', () => window.addIngredientRow());
    if (addInstBtn) addInstBtn.addEventListener('click', () => window.addInstructionRow());

    // Populate Initial Rows
    addIngredientRow('2 fresh salmon fillets (6 oz each)');
    addIngredientRow('3 cloves garlic, minced');
    addIngredientRow('1 cup heavy cream or coconut cream');

    addInstructionRow('Season salmon fillets with salt, pepper, and garlic powder.');
    addInstructionRow('Pan-sear salmon in olive oil over medium-high heat for 4-5 minutes per side until golden crust forms.');
    addInstructionRow('Simmer garlic, heavy cream, sun-dried tomatoes, and spinach until rich and velvety. Return salmon and serve!');
  }

  // -------------------------------------------------------------
  // PUBLISH RECIPE FORM SUBMISSION
  // -------------------------------------------------------------
  function getUserRecipes() {
    const data = localStorage.getItem('flavorbook_user_recipes');
    return data ? JSON.parse(data) : [];
  }

  function saveUserRecipes(recipes) {
    localStorage.setItem('flavorbook_user_recipes', JSON.stringify(recipes));
    updateProfileStats();
  }

  function initPublishForm() {
    const form = document.getElementById('publish-recipe-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const title = document.getElementById('recipe-title-input').value.trim();
      const description = document.getElementById('recipe-desc-input').value.trim();
      const category = document.getElementById('recipe-category-select').value;
      const cuisine = document.getElementById('recipe-cuisine-select').value;
      const prepTime = parseInt(document.getElementById('recipe-preptime-input').value) || 15;
      const cookTime = parseInt(document.getElementById('recipe-cooktime-input').value) || 20;
      const servings = parseInt(document.getElementById('recipe-servings-input').value) || 4;
      const difficulty = document.getElementById('recipe-difficulty-select').value;
      const calories = parseInt(document.getElementById('recipe-calories-input').value) || 350;

      // Extract ingredients
      const ingInputs = document.querySelectorAll('.ingredient-item-input');
      const ingredients = Array.from(ingInputs)
        .map(input => input.value.trim())
        .filter(val => val.length > 0);

      // Extract instructions
      const instInputs = document.querySelectorAll('.instruction-step-input');
      const instructions = Array.from(instInputs)
        .map((input, index) => ({
          step: index + 1,
          title: `Step ${index + 1}`,
          description: input.value.trim()
        }))
        .filter(item => item.description.length > 0);

      // Extract selected tags
      const tagCbs = document.querySelectorAll('.tag-cb:checked');
      const tags = Array.from(tagCbs).map(cb => cb.value);

      if (ingredients.length === 0) {
        if (typeof showToast === 'function') showToast('Please add at least one ingredient!', 'warning');
        return;
      }

      if (instructions.length === 0) {
        if (typeof showToast === 'function') showToast('Please add at least one cooking step!', 'warning');
        return;
      }

      const profile = getUserProfile();

      // Create new Recipe Object
      const newRecipe = {
        id: Date.now(),
        title: title,
        description: description,
        image: currentCoverUrl,
        category: category,
        cuisine: cuisine,
        mealType: category,
        prepTime: prepTime,
        cookTime: cookTime,
        servings: servings,
        calories: calories,
        rating: 5.0,
        reviewsCount: 1,
        difficulty: difficulty,
        isUserPublished: true,
        author: profile.name,
        ingredients: ingredients,
        instructions: instructions,
        tags: tags,
        createdAt: new Date().toISOString()
      };

      const userRecipes = getUserRecipes();
      userRecipes.unshift(newRecipe);
      saveUserRecipes(userRecipes);

      if (typeof showToast === 'function') {
        showToast(`🎉 "${title}" Published Successfully!`, 'success');
      }

      // Re-render published list
      renderPublishedRecipes();

      // Switch to Published Recipes tab
      const publishedTabBtn = document.querySelector('.profile-tab-btn[data-tab="tab-published"]');
      if (publishedTabBtn) publishedTabBtn.click();

      // Reset form
      form.reset();
    });
  }

  // -------------------------------------------------------------
  // RENDER USER PUBLISHED RECIPES
  // -------------------------------------------------------------
  function renderPublishedRecipes() {
    const grid = document.getElementById('published-recipes-grid');
    if (!grid) return;

    const recipes = getUserRecipes();

    if (recipes.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: var(--card-bg); border-radius: 24px; border: 1px dashed var(--border-color);">
          <div style="font-size: 3.5rem; margin-bottom: 16px;">🍳</div>
          <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.5rem; margin-bottom: 10px;">No Recipes Published Yet</h3>
          <p style="color: var(--text-light); max-width: 450px; margin: 0 auto 24px;">Share your secret dishes and homemade delicacies with the global FlavorBook cooking community!</p>
          <button class="btn btn-primary" onclick="document.querySelector('.profile-tab-btn[data-tab=\\'tab-publish\\']').click();">
            <i class="fa-solid fa-circle-plus"></i> Publish Your First Recipe
          </button>
        </div>
      `;
      return;
    }

    grid.innerHTML = recipes.map(recipe => `
      <div class="recipe-card" data-id="${recipe.id}">
        <div class="recipe-image-wrap">
          <img src="${recipe.image}" alt="${recipe.title}" loading="lazy">
          <span class="recipe-badge">${recipe.category}</span>
          <button class="delete-user-recipe-btn" data-id="${recipe.id}" title="Delete Recipe" style="position: absolute; top: 12px; right: 12px; width: 36px; height: 36px; border-radius: 50%; background: rgba(235, 77, 75, 0.9); color: #fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); transition: transform 0.2s;">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>

        <div class="recipe-content">
          <div class="recipe-meta">
            <span><i class="fa-regular fa-clock"></i> ${recipe.prepTime + recipe.cookTime} min</span>
            <span><i class="fa-solid fa-chart-line"></i> ${recipe.difficulty}</span>
          </div>

          <h3 class="recipe-title">
            <a href="recipe.html?id=${recipe.id}">${recipe.title}</a>
          </h3>

          <p class="recipe-desc" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 0.9rem; color: var(--text-light); margin-bottom: 16px;">
            ${recipe.description}
          </p>

          <div class="recipe-footer" style="display: flex; align-items: center; justify-content: space-between;">
            <span class="recipe-rating"><i class="fa-solid fa-star" style="color: #ffb142;"></i> ${recipe.rating} (${recipe.reviewsCount})</span>
            <a href="recipe.html?id=${recipe.id}" class="btn btn-outline btn-sm" style="padding: 6px 16px; border-radius: 20px; font-size: 0.85rem;">View Details</a>
          </div>
        </div>
      </div>
    `).join('');

    // Attach delete listeners
    grid.querySelectorAll('.delete-user-recipe-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const idToDelete = Number(btn.getAttribute('data-id'));
        if (confirm('Are you sure you want to delete this recipe?')) {
          deleteUserRecipe(idToDelete);
        }
      });
    });
  }

  function deleteUserRecipe(id) {
    let recipes = getUserRecipes();
    recipes = recipes.filter(r => r.id !== id);
    saveUserRecipes(recipes);
    renderPublishedRecipes();
    if (typeof showToast === 'function') {
      showToast('Recipe deleted successfully', 'info');
    }
  }

  // -------------------------------------------------------------
  // RENDER SAVED FAVORITES
  // -------------------------------------------------------------
  async function renderFavoritesRecipes() {
    const grid = document.getElementById('favorites-recipes-grid');
    if (!grid) return;

    const favoriteIds = JSON.parse(localStorage.getItem('flavorbook_favorites') || '[]');
    if (favoriteIds.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: var(--card-bg); border-radius: 24px; border: 1px dashed var(--border-color);">
          <div style="font-size: 3.5rem; margin-bottom: 16px;">❤️</div>
          <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.5rem; margin-bottom: 10px;">No Favorites Saved Yet</h3>
          <p style="color: var(--text-light); max-width: 450px; margin: 0 auto 24px;">Explore our culinary collection and tap the heart icon on any recipe to save it here!</p>
          <a href="recipes.html" class="btn btn-primary">
            <i class="fa-solid fa-magnifying-glass"></i> Explore Delicious Recipes
          </a>
        </div>
      `;
      return;
    }

    try {
      const response = await fetch('data/recipes.json');
      const staticRecipes = await response.json();
      const userRecipes = getUserRecipes();
      const allRecipes = [...userRecipes, ...staticRecipes];

      const favoritedRecipes = allRecipes.filter(r => favoriteIds.includes(r.id));

      grid.innerHTML = favoritedRecipes.map(recipe => `
        <div class="recipe-card" data-id="${recipe.id}">
          <div class="recipe-image-wrap">
            <img src="${recipe.image}" alt="${recipe.title}" loading="lazy">
            <span class="recipe-badge">${recipe.category}</span>
          </div>

          <div class="recipe-content">
            <div class="recipe-meta">
              <span><i class="fa-regular fa-clock"></i> ${recipe.prepTime + recipe.cookTime} min</span>
              <span><i class="fa-solid fa-chart-line"></i> ${recipe.difficulty}</span>
            </div>

            <h3 class="recipe-title">
              <a href="recipe.html?id=${recipe.id}">${recipe.title}</a>
            </h3>

            <div class="recipe-footer" style="display: flex; align-items: center; justify-content: space-between; margin-top: 14px;">
              <span class="recipe-rating"><i class="fa-solid fa-star" style="color: #ffb142;"></i> ${recipe.rating}</span>
              <a href="recipe.html?id=${recipe.id}" class="btn btn-primary btn-sm" style="padding: 6px 16px; border-radius: 20px; font-size: 0.85rem;">Cook Recipe</a>
            </div>
          </div>
        </div>
      `).join('');
    } catch (e) {
      console.error('Error rendering saved favorites:', e);
    }
  }

});
