async function fetchCategories() {
    try {
        const response = await fetch('https://www.themealdb.com/api/json/v1/1/categories.php');
        const data = await response.json();
        const categoriesDiv = document.getElementById('categories');
        categoriesDiv.innerHTML = data.categories.map(category => `<a class="dropdown-item" href="#" onclick="fetchMeals('${category.strCategory}')">${category.strCategory}</a>`).join('');
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

async function fetchMeals(category) {
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
        const data = await response.json();
        const mealsDiv = document.getElementById('example-meals');
        const welcomeSection = document.getElementById('welcome');
        if (welcomeSection) {
            welcomeSection.style.display = 'none';
        }
        mealsDiv.innerHTML = data.meals.map(meal => `
            <div class="col-md-4">
                <div class="card">
                    <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
                    <div class="card-body">
                        <h5 class="card-title">${meal.strMeal}</h5>
                        <button class="btn btn-primary" onclick="fetchMealDetails('${meal.idMeal}')">View Recipe</button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching meals:', error);
    }
}

async function fetchMealDetails(mealId) {
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
        const data = await response.json();
        const meal = data.meals[0];
        const mealModalLabel = document.getElementById('mealModalLabel');
        const mealModalBody = document.getElementById('mealModalBody');
        mealModalLabel.textContent = meal.strMeal;
        mealModalBody.innerHTML = `
            <img src="${meal.strMealThumb}" class="img-fluid mb-3" alt="${meal.strMeal}">
            <h3>Ingredients:</h3>
            <ul class="list-group list-group-flush">
                ${Object.keys(meal).filter(key => key.startsWith('strIngredient') && meal[key]).map(key => `<li class="list-group-item">${meal[key]} - ${meal[`strMeasure${key.slice(13)}`]}</li>`).join('')}
            </ul>
            <h3 class="mt-3">Instructions:</h3>
            <p>${meal.strInstructions}</p>
        `;
        $('#mealModal').modal('show');
    } catch (error) {
        console.error('Error fetching meal details:', error);
    }
}

async function searchMeals(query) {
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
        const data = await response.json();
        const mealsDiv = document.getElementById('example-meals');
        const welcomeSection = document.getElementById('welcome');
        if (welcomeSection) {
            welcomeSection.style.display = 'none';
        }
        if (data.meals) {
            mealsDiv.innerHTML = data.meals.map(meal => `
                <div class="col-md-4">
                    <div class="card">
                        <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
                        <div class="card-body">
                            <h5 class="card-title">${meal.strMeal}</h5>
                            <button class="btn btn-primary" onclick="fetchMealDetails('${meal.idMeal}')">View Recipe</button>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            mealsDiv.innerHTML = '<p>No meals found.</p>';
        }
    } catch (error) {
        console.error('Error searching meals:', error);
    }
}

async function loadCarouselImages() {
    try {
        const response = await fetch('https://www.themealdb.com/api/json/v1/1/filter.php?c=Seafood');
        const data = await response.json();
        const carouselIndicators = document.getElementById('carousel-indicators');
        const carouselInner = document.getElementById('carousel-inner');
        
        data.meals.slice(0, 3).forEach((meal, index) => {
            const isActive = index === 0 ? 'active' : '';
            carouselIndicators.innerHTML += `<li data-target="#carouselExampleCaptions" data-slide-to="${index}" class="${isActive}"></li>`;
            carouselInner.innerHTML += `
                <div class="carousel-item ${isActive}">
                    <img src="${meal.strMealThumb}" class="d-block w-100" alt="${meal.strMeal}">
                    <div class="carousel-caption d-none d-md-block">
                        <h5>${meal.strMeal}</h5>
                        <p>Explore this delicious meal.</p>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error loading carousel images:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchCategories();
    fetchMeals('Beef');
    loadCarouselImages();
});

document.getElementById('search-form').addEventListener('submit', event => {
    event.preventDefault();
    const query = document.getElementById('search-input').value;
    searchMeals(query);
});
// Función para manejar favoritos
// Función para manejar favoritos
function toggleFavorite(mealId) {
    let favorites = JSON.parse(localStorage.getItem('mealFavorites')) || [];
    if (favorites.includes(mealId)) {
        favorites = favorites.filter(id => id !== mealId);
    } else {
        favorites.push(mealId);
    }
    localStorage.setItem('mealFavorites', JSON.stringify(favorites));
    updateFavoriteButton(mealId);
}

// Función para actualizar el estado del botón de favoritos
function updateFavoriteButton(mealId) {
    const favorites = JSON.parse(localStorage.getItem('mealFavorites')) || [];
    const button = document.querySelector(`.favorite-button[data-id="${mealId}"]`);
    if (button) {
        button.classList.toggle('favorited', favorites.includes(mealId));
    }
}

// Modificación en fetchMeals para añadir botones de favoritos
async function fetchMeals(category) {
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
        const data = await response.json();
        const mealsDiv = document.getElementById('example-meals');
        const welcomeSection = document.getElementById('welcome');
        if (welcomeSection) {
            welcomeSection.style.display = 'none';
        }
        mealsDiv.innerHTML = data.meals.map(meal => `
            <div class="col-md-4">
                <div class="card">
                    <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
                    <div class="card-body">
                        <h5 class="card-title">${meal.strMeal}</h5>
                        <button class="btn btn-primary" onclick="fetchMealDetails('${meal.idMeal}')">View Recipe</button>
                        <button class="favorite-button" data-id="${meal.idMeal}" onclick="toggleFavorite('${meal.idMeal}')">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        data.meals.forEach(meal => updateFavoriteButton(meal.idMeal));
    } catch (error) {
        console.error('Error fetching meals:', error);
    }
}

// Asegúrate de llamar a updateFavoriteButton cuando se cargue la página y se actualice la lista de comidas
document.addEventListener('DOMContentLoaded', () => {
    fetchCategories();
    fetchMeals('Beef');
    loadCarouselImages();
});
// Función para agregar un comentario
function addComment(mealId, comment, rating) {
    let comments = JSON.parse(localStorage.getItem('mealComments')) || {};
    if (!comments[mealId]) {
        comments[mealId] = [];
    }
    comments[mealId].push({ comment, rating });
    localStorage.setItem('mealComments', JSON.stringify(comments));
    displayComments(mealId);
}

// Función para mostrar los comentarios
function displayComments(mealId) {
    const comments = JSON.parse(localStorage.getItem('mealComments')) || {};
    const commentsDiv = document.getElementById('comments');
    if (comments[mealId]) {
        commentsDiv.innerHTML = comments[mealId].map(comment => `
            <div class="comment">
                <p>${comment.comment}</p>
                <p>Rating: ${comment.rating} / 5</p>
            </div>
        `).join('');
    } else {
        commentsDiv.innerHTML = '<p>No comments yet.</p>';
    }
}

// Modificación en fetchMealDetails para añadir la sección de comentarios
async function fetchMealDetails(mealId) {
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
        const data = await response.json();
        const meal = data.meals[0];
        const mealModalLabel = document.getElementById('mealModalLabel');
        const mealModalBody = document.getElementById('mealModalBody');
        mealModalLabel.textContent = meal.strMeal;
        mealModalBody.innerHTML = `
            <img src="${meal.strMealThumb}" class="img-fluid mb-3" alt="${meal.strMeal}">
            <h3>Ingredients:</h3>
            <ul class="list-group list-group-flush">
                ${Object.keys(meal).filter(key => key.startsWith('strIngredient') && meal[key]).map(key => `<li class="list-group-item">${meal[key]} - ${meal[`strMeasure${key.slice(13)}`]}</li>`).join('')}
            </ul>
            <h3 class="mt-3">Instructions:</h3>
            <p>${meal.strInstructions}</p>
            <h3 class="mt-3">Comments:</h3>
            <div id="comments"></div>
            <form id="comment-form" onsubmit="event.preventDefault(); addComment('${mealId}', this.comment.value, this.rating.value);">
                <div class="form-group">
                    <label for="comment">Comment:</label>
                    <textarea class="form-control" id="comment" name="comment" required></textarea>
                </div>
                <div class="form-group">
                    <label for="rating">Rating:</label>
                    <select class="form-control" id="rating" name="rating" required>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">Submit</button>
            </form>
        `;
        displayComments(mealId);
        $('#mealModal').modal('show');
    } catch (error) {
        console.error('Error fetching meal details:', error);
    }
}
window.fetchMealDetails = fetchMealDetails;


