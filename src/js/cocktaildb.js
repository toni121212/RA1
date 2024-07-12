async function fetchCategories() {
    try {
        const response = await fetch('https://www.thecocktaildb.com/api/json/v1/1/list.php?c=list');
        const data = await response.json();
        const categoriesDiv = document.getElementById('categories');
        categoriesDiv.innerHTML = data.drinks.map(category => `<a class="dropdown-item" href="#" onclick="fetchCocktails('${category.strCategory}')">${category.strCategory}</a>`).join('');
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

async function fetchCocktails(category) {
    try {
        const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=${category}`);
        const data = await response.json();
        const cocktailsDiv = document.getElementById('example-cocktails');
        const welcomeSection = document.getElementById('welcome');
        if (welcomeSection) {
            welcomeSection.style.display = 'none';
        }
        cocktailsDiv.innerHTML = data.drinks.map(cocktail => `
            <div class="col-md-4">
                <div class="card">
                    <img src="${cocktail.strDrinkThumb}" class="card-img-top" alt="${cocktail.strDrink}">
                    <div class="card-body">
                        <h5 class="card-title">${cocktail.strDrink}</h5>
                        <button class="btn btn-primary" onclick="fetchCocktailDetails('${cocktail.idDrink}')">View Recipe</button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching cocktails:', error);
    }
}

async function fetchCocktailDetails(cocktailId) {
    try {
        const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${cocktailId}`);
        const data = await response.json();
        const cocktail = data.drinks[0];
        const cocktailModalLabel = document.getElementById('cocktailModalLabel');
        const cocktailModalBody = document.getElementById('cocktailModalBody');
        cocktailModalLabel.textContent = cocktail.strDrink;
        cocktailModalBody.innerHTML = `
            <img src="${cocktail.strDrinkThumb}" class="img-fluid mb-3" alt="${cocktail.strDrink}">
            <h3>Ingredients:</h3>
            <ul class="list-group list-group-flush">
                ${Object.keys(cocktail).filter(key => key.startsWith('strIngredient') && cocktail[key]).map(key => `<li class="list-group-item">${cocktail[key]} - ${cocktail[`strMeasure${key.slice(13)}`]}</li>`).join('')}
            </ul>
            <h3 class="mt-3">Instructions:</h3>
            <p>${cocktail.strInstructions}</p>
        `;
        $('#cocktailModal').modal('show');
    } catch (error) {
        console.error('Error fetching cocktail details:', error);
    }
}

async function searchCocktails(query) {
    try {
        const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${query}`);
        const data = await response.json();
        const cocktailsDiv = document.getElementById('example-cocktails');
        const welcomeSection = document.getElementById('welcome');
        if (welcomeSection) {
            welcomeSection.style.display = 'none';
        }
        if (data.drinks) {
            cocktailsDiv.innerHTML = data.drinks.map(cocktail => `
                <div class="col-md-4">
                    <div class="card">
                        <img src="${cocktail.strDrinkThumb}" class="card-img-top" alt="${cocktail.strDrink}">
                        <div class="card-body">
                            <h5 class="card-title">${cocktail.strDrink}</h5>
                            <button class="btn btn-primary" onclick="fetchCocktailDetails('${cocktail.idDrink}')">View Recipe</button>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            cocktailsDiv.innerHTML = '<p>No cocktails found.</p>';
        }
    } catch (error) {
        console.error('Error searching cocktails:', error);
    }
}

async function loadCarouselImages() {
    try {
        const response = await fetch('https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=Ordinary_Drink');
        const data = await response.json();
        const carouselIndicators = document.getElementById('carousel-indicators');
        const carouselInner = document.getElementById('carousel-inner');
        
        data.drinks.slice(0, 3).forEach((cocktail, index) => {
            const isActive = index === 0 ? 'active' : '';
            carouselIndicators.innerHTML += `<li data-target="#carouselExampleCaptions" data-slide-to="${index}" class="${isActive}"></li>`;
            carouselInner.innerHTML += `
                <div class="carousel-item ${isActive}">
                    <img src="${cocktail.strDrinkThumb}" class="d-block w-100" alt="${cocktail.strDrink}">
                    <div class="carousel-caption d-none d-md-block">
                        <h5>${cocktail.strDrink}</h5>
                        <p>Explore this delicious cocktail.</p>
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
    fetchCocktails('Cocktail');
    loadCarouselImages();
});

document.getElementById('search-form').addEventListener('submit', event => {
    event.preventDefault();
    const query = document.getElementById('search-input').value;
    searchCocktails(query);
});
// Función para manejar favoritos
function toggleFavorite(cocktailId) {
    let favorites = JSON.parse(localStorage.getItem('cocktailFavorites')) || [];
    if (favorites.includes(cocktailId)) {
        favorites = favorites.filter(id => id !== cocktailId);
    } else {
        favorites.push(cocktailId);
    }
    localStorage.setItem('cocktailFavorites', JSON.stringify(favorites));
    updateFavoriteButton(cocktailId);
}

// Función para actualizar el estado del botón de favoritos
function updateFavoriteButton(cocktailId) {
    const favorites = JSON.parse(localStorage.getItem('cocktailFavorites')) || [];
    const button = document.querySelector(`.favorite-button[data-id="${cocktailId}"]`);
    if (button) {
        button.classList.toggle('favorited', favorites.includes(cocktailId));
    }
}

// Modificación en fetchCocktails para añadir botones de favoritos
async function fetchCocktails(category) {
    try {
        const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=${category}`);
        const data = await response.json();
        const cocktailsDiv = document.getElementById('example-cocktails');
        const welcomeSection = document.getElementById('welcome');
        if (welcomeSection) {
            welcomeSection.style.display = 'none';
        }
        cocktailsDiv.innerHTML = data.drinks.map(cocktail => `
            <div class="col-md-4">
                <div class="card">
                    <img src="${cocktail.strDrinkThumb}" class="card-img-top" alt="${cocktail.strDrink}">
                    <div class="card-body">
                        <h5 class="card-title">${cocktail.strDrink}</h5>
                        <button class="btn btn-primary" onclick="fetchCocktailDetails('${cocktail.idDrink}')">View Recipe</button>
                        <button class="favorite-button" data-id="${cocktail.idDrink}" onclick="toggleFavorite('${cocktail.idDrink}')">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        data.drinks.forEach(cocktail => updateFavoriteButton(cocktail.idDrink));
    } catch (error) {
        console.error('Error fetching cocktails:', error);
    }
}

// Asegúrate de llamar a updateFavoriteButton cuando se cargue la página y se actualice la lista de cócteles
document.addEventListener('DOMContentLoaded', () => {
    fetchCategories();
    fetchCocktails('Cocktail');
    loadCarouselImages();
});

// Función para agregar un comentario
function addComment(cocktailId, comment, rating) {
    let comments = JSON.parse(localStorage.getItem('cocktailComments')) || {};
    if (!comments[cocktailId]) {
        comments[cocktailId] = [];
    }
    comments[cocktailId].push({ comment, rating });
    localStorage.setItem('cocktailComments', JSON.stringify(comments));
    displayComments(cocktailId);
}

// Función para mostrar los comentarios
function displayComments(cocktailId) {
    const comments = JSON.parse(localStorage.getItem('cocktailComments')) || {};
    const commentsDiv = document.getElementById('comments');
    if (comments[cocktailId]) {
        commentsDiv.innerHTML = comments[cocktailId].map(comment => `
            <div class="comment">
                <p>${comment.comment}</p>
                <p>Rating: ${comment.rating} / 5</p>
            </div>
        `).join('');
    } else {
        commentsDiv.innerHTML = '<p>No comments yet.</p>';
    }
}

// Modificación en fetchCocktailDetails para añadir la sección de comentarios
async function fetchCocktailDetails(cocktailId) {
    try {
        const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${cocktailId}`);
        const data = await response.json();
        const cocktail = data.drinks[0];
        const cocktailModalLabel = document.getElementById('cocktailModalLabel');
        const cocktailModalBody = document.getElementById('cocktailModalBody');
        cocktailModalLabel.textContent = cocktail.strDrink;
        cocktailModalBody.innerHTML = `
            <img src="${cocktail.strDrinkThumb}" class="img-fluid mb-3" alt="${cocktail.strDrink}">
            <h3>Ingredients:</h3>
            <ul class="list-group list-group-flush">
                ${Object.keys(cocktail).filter(key => key.startsWith('strIngredient') && cocktail[key]).map(key => `<li class="list-group-item">${cocktail[key]} - ${cocktail[`strMeasure${key.slice(13)}`]}</li>`).join('')}
            </ul>
            <h3 class="mt-3">Instructions:</h3>
            <p>${cocktail.strInstructions}</p>
            <h3 class="mt-3">Comments:</h3>
            <div id="comments"></div>
            <form id="comment-form" onsubmit="event.preventDefault(); addComment('${cocktailId}', this.comment.value, this.rating.value);">
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
        displayComments(cocktailId);
        $('#cocktailModal').modal('show');
    } catch (error) {
        console.error('Error fetching cocktail details:', error);
    }
}
window.fetchCocktailDetails = fetchCocktailDetails;
