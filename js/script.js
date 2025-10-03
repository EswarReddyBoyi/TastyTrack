// -------------------- ELEMENTS --------------------
const recipeForm = document.getElementById('recipe-form');
const recipesContainer = document.getElementById('recipes-container');
const searchInput = document.getElementById('search');
const profileBtn = document.getElementById('profile-btn');
const profileMenu = document.getElementById('profile-menu');

// -------------------- PROFILE MENU TOGGLE --------------------
profileBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent window click from hiding menu
    profileMenu.style.display = profileMenu.style.display === 'block' ? 'none' : 'block';
});

// Close profile menu if clicked outside
window.addEventListener('click', (e) => {
    if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
        profileMenu.style.display = 'none';
    }
});

// Prevent closing when clicking inside menu
profileMenu.addEventListener('click', (e) => {
    e.stopPropagation();
});


// -------------------- LOCAL STORAGE USER --------------------
let user = JSON.parse(localStorage.getItem('user')) || null;

// Show user name next to profile icon
// -------------------- SHOW USER NAME --------------------
function showUserName() {
    removeUserName();
    if (!user) return;

    const nameSpan = document.createElement('span');
    nameSpan.id = 'user-name-span';
    nameSpan.textContent = user.name || 'Guest';
    nameSpan.style.marginRight = '10px';
    nameSpan.style.color = '#FF4500';
    nameSpan.style.fontWeight = 'bold';
    nameSpan.style.position = 'relative';
    nameSpan.style.top = '-3px'; // move it slightly up
    profileBtn.parentNode.insertBefore(nameSpan, profileBtn);
}

function removeUserName() {
    const existingSpan = document.getElementById('user-name-span');
    if (existingSpan) existingSpan.remove();
}

// -------------------- PROFILE MENU --------------------
function updateProfileMenu() {
    profileMenu.innerHTML = '';

    if (user) {
        // Logged in → show Edit Profile & Logout
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit Profile';
        editBtn.style.margin = '5px';
        editBtn.style.padding = '5px';
        editBtn.style.borderRadius = '5px';
        editBtn.style.cursor = 'pointer';
        editBtn.addEventListener('click', showEditProfile);
        profileMenu.appendChild(editBtn);

        const logoutBtn = document.createElement('button');
        logoutBtn.textContent = 'Logout';
        logoutBtn.style.margin = '5px';
        logoutBtn.style.padding = '5px';
        logoutBtn.style.borderRadius = '5px';
        logoutBtn.style.cursor = 'pointer';
        logoutBtn.addEventListener('click', () => {
            user = null;
            localStorage.removeItem('user');
            removeUserName();
            updateProfileMenu();
        });
        profileMenu.appendChild(logoutBtn);
    } else {
        // Not logged in → show Login form
        const loginDiv = document.createElement('div');
        loginDiv.innerHTML = `
            <input type="text" id="login-name" placeholder="Name" style="margin:5px;padding:5px;width:90%">
            <input type="email" id="login-email" placeholder="Email" style="margin:5px;padding:5px;width:90%">
            <input type="text" id="login-place" placeholder="Place" style="margin:5px;padding:5px;width:90%">
            <button id="login-submit" style="margin:5px;padding:5px;width:95%;border-radius:5px;cursor:pointer">Save Profile</button>
        `;
        profileMenu.appendChild(loginDiv);

        document.getElementById('login-submit').addEventListener('click', () => {
            const name = document.getElementById('login-name').value.trim();
            const email = document.getElementById('login-email').value.trim();
            const place = document.getElementById('login-place').value.trim();

            if (!name || !email) {
                alert('Please fill in Name and Email');
                return;
            }

            user = { name, email, place };
            localStorage.setItem('user', JSON.stringify(user));
            showUserName();
            updateProfileMenu();
        });
    }
}

// -------------------- EDIT PROFILE --------------------
function showEditProfile(e) {
    e.stopPropagation(); // prevent closing immediately
    profileMenu.style.display = 'block'; // force open menu

    profileMenu.innerHTML = `
        <input type="text" id="edit-name" placeholder="Name" value="${user.name}" style="margin:5px;padding:5px;width:90%">
        <input type="email" id="edit-email" placeholder="Email" value="${user.email}" style="margin:5px;padding:5px;width:90%">
        <input type="text" id="edit-place" placeholder="Place" value="${user.place}" style="margin:5px;padding:5px;width:90%">
        <button id="edit-submit" style="margin:5px;padding:5px;width:95%;border-radius:5px;cursor:pointer">Update Profile</button>
    `;

    document.getElementById('edit-submit').addEventListener('click', () => {
        const name = document.getElementById('edit-name').value.trim();
        const email = document.getElementById('edit-email').value.trim();
        const place = document.getElementById('edit-place').value.trim();

        if (!name || !email) {
            alert('Please fill in Name and Email');
            return;
        }

        user.name = name;
        user.email = email;
        user.place = place;
        localStorage.setItem('user', JSON.stringify(user));

        showUserName(); // update name beside profile
        updateProfileMenu(); // show menu buttons again
        showToast('Profile updated successfully!');
    });
}


// -------------------- RECIPES --------------------
let recipes = JSON.parse(localStorage.getItem('recipes')) || [];

function displayRecipes(recipesToDisplay) {
    recipesContainer.innerHTML = '';
    recipesToDisplay.forEach((recipe) => {
        const card = document.createElement('div');
        card.classList.add('recipe-card');
        card.innerHTML = `
            <img src="${recipe.image || 'images/placeholder.png'}" alt="${recipe.name}">
            <h3>${recipe.name}</h3>
        `;
        card.addEventListener('click', () => showRecipeDetails(recipe));
        recipesContainer.appendChild(card);
    });
}

function showRecipeDetails(recipe) {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-btn">Close</button>
            <h2>${recipe.name}</h2>
            <img src="${recipe.image || 'images/placeholder.png'}" alt="${recipe.name}">
            <h3>Ingredients:</h3>
            <p>${recipe.ingredients.join(', ')}</p>
            <h3>Preparation Steps:</h3>
            <p>${recipe.steps}</p>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
}

// Add recipe
recipeForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const ingredients = document.getElementById('ingredients').value.split(',').map(i => i.trim());
    const steps = document.getElementById('steps').value.trim();
    const imageFile = document.getElementById('image').files[0];

    if (!name || !ingredients.length || !steps) {
        alert('Please fill in all fields.');
        return;
    }

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function() {
            recipes.push({ name, ingredients, steps, image: reader.result });
            localStorage.setItem('recipes', JSON.stringify(recipes));
            displayRecipes(recipes);
            recipeForm.reset();
        };
        reader.readAsDataURL(imageFile);
    } else {
        recipes.push({ name, ingredients, steps, image: '' });
        localStorage.setItem('recipes', JSON.stringify(recipes));
        displayRecipes(recipes);
        recipeForm.reset();
    }
});

// Search
searchInput.addEventListener('input', function() {
    const query = searchInput.value.toLowerCase();
    const filtered = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(query) ||
        recipe.ingredients.some(i => i.toLowerCase().includes(query))
    );
    displayRecipes(filtered);
});

// -------------------- INITIALIZE --------------------
displayRecipes(recipes);
showUserName();
updateProfileMenu();

