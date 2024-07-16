// Funciones para gestionar las categorías y elementos de la API de cócteles
async function fetchCocktailCategories() {
    try {
        const response = await fetch('https://www.thecocktaildb.com/api/json/v1/1/list.php?c=list');
        const data = await response.json();
        const categoriesDiv = document.getElementById('categories');
        categoriesDiv.innerHTML = data.drinks.map(category => `<a class="dropdown-item" href="#" onclick="fetchCocktails('${category.strCategory}')">${category.strCategory}</a>`).join('');
    } catch (error) {
        console.error('Error fetching cocktail categories:', error);
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
                        <button class="favorite-button" data-id="${cocktail.idDrink}" onclick="toggleFavorite('${cocktail.idDrink}', '${cocktail.strDrink}', '${cocktail.strDrinkThumb}', 'cocktail')">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        data.drinks.forEach(cocktail => updateFavoriteButton(cocktail.idDrink, 'cocktail'));
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

        if (!cocktailModalLabel || !cocktailModalBody) {
            throw new Error("Modal elements not found");
        }

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
                            <button class="favorite-button" data-id="${cocktail.idDrink}" onclick="toggleFavorite('${cocktail.idDrink}', '${cocktail.strDrink}', '${cocktail.strDrinkThumb}', 'cocktail')">
                                <i class="fas fa-heart"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
            data.drinks.forEach(cocktail => updateFavoriteButton(cocktail.idDrink, 'cocktail'));
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

        if (!carouselIndicators || !carouselInner) {
            throw new Error("Carousel elements not found");
        }

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

// Función para manejar favoritos
function toggleFavorite(itemId, itemName, itemThumb, itemType) {
    const user = firebase.auth().currentUser;
    if (user) {
        const userFavoritesRef = db.collection('users').doc(user.uid).collection('favorites');
        userFavoritesRef.doc(itemId).get().then(doc => {
            if (doc.exists) {
                userFavoritesRef.doc(itemId).delete().then(() => {
                    console.log('Favorite removed');
                    updateFavoriteButton(itemId, itemType);
                }).catch(error => {
                    console.error('Error removing favorite:', error);
                });
            } else {
                userFavoritesRef.doc(itemId).set({
                    name: itemName,
                    thumb: itemThumb,
                    type: itemType // Asegúrate de agregar el tipo de favorito
                }).then(() => {
                    console.log('Favorite added');
                    updateFavoriteButton(itemId, itemType);
                }).catch(error => {
                    console.error('Error adding favorite:', error);
                });
            }
        }).catch(error => {
            console.error('Error getting favorite:', error);
        });
    } else {
        alert('Please log in to save favorites.');
    }
}

// Función para actualizar el estado del botón de favoritos
function updateFavoriteButton(itemId, itemType) {
    const user = firebase.auth().currentUser;
    if (user) {
        const userFavoritesRef = db.collection('users').doc(user.uid).collection('favorites');
        userFavoritesRef.doc(itemId).get().then(doc => {
            const button = document.querySelector(`.favorite-button[data-id="${itemId}"]`);
            if (button) {
                button.classList.toggle('favorited', doc.exists);
            }
        }).catch(error => {
            console.error('Error getting favorite:', error);
        });
    }
}

// Función para agregar un comentario
function addComment(itemId, comment, rating) {
    const user = firebase.auth().currentUser;
    if (user) {
        const itemCommentsRef = db.collection('items').doc(itemId).collection('comments');
        itemCommentsRef.add({
            userId: user.uid,
            comment: comment,
            rating: rating,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            console.log('Comment added');
            displayComments(itemId);
        }).catch(error => {
            console.error('Error adding comment:', error);
        });
    } else {
        alert('Please log in to add a comment.');
    }
}

// Función para mostrar los comentarios
function displayComments(itemId) {
    const itemCommentsRef = db.collection('items').doc(itemId).collection('comments').orderBy('timestamp', 'desc');
    itemCommentsRef.get().then(snapshot => {
        const commentsDiv = document.getElementById('comments');
        commentsDiv.innerHTML = snapshot.docs.map(doc => {
            const data = doc.data();
            return `
                <div class="comment">
                    <p>${data.comment}</p>
                    <p>Rating: ${data.rating} / 5</p>
                </div>
            `;
        }).join('');
    }).catch(error => {
        console.error('Error getting comments:', error);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchCocktailCategories();
    fetchCocktails('Cocktail');
    loadCarouselImages();
    auth.onAuthStateChanged(user => {
        if (user) {
            const userFavoritesRef = db.collection('users').doc(user.uid).collection('favorites');
            userFavoritesRef.onSnapshot(snapshot => {
                snapshot.docs.forEach(doc => {
                    updateFavoriteButton(doc.id, doc.data().type);
                });
            });
        }
    });
});

document.getElementById('search-form').addEventListener('submit', event => {
    event.preventDefault();
    const query = document.getElementById('search-input').value;
    searchCocktails(query);
});

window.fetchCocktailDetails = fetchCocktailDetails;
