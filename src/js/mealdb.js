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
                        <button class="favorite-button" data-id="${meal.idMeal}" onclick="toggleFavorite('${meal.idMeal}', '${meal.strMeal}', '${meal.strMealThumb}')">
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
                            <button class="favorite-button" data-id="${meal.idMeal}" onclick="toggleFavorite('${meal.idMeal}', '${meal.strMeal}', '${meal.strMealThumb}')">
                                <i class="fas fa-heart"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
            data.meals.forEach(meal => updateFavoriteButton(meal.idMeal));
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

function toggleFavorite(mealId, mealName, mealThumb) {
    const user = firebase.auth().currentUser;
    if (user) {
        const userFavoritesRef = db.collection('users').doc(user.uid).collection('favorites');
        userFavoritesRef.doc(mealId).get().then(doc => {
            if (doc.exists) {
                userFavoritesRef.doc(mealId).delete().then(() => {
                    console.log('Favorite removed');
                    updateFavoriteButton(mealId);
                }).catch(error => {
                    console.error('Error removing favorite:', error);
                });
            } else {
                userFavoritesRef.doc(mealId).set({
                    name: mealName,
                    thumb: mealThumb,
                    type: 'meal' // Asegúrate de agregar el tipo de favorito
                }).then(() => {
                    console.log('Favorite added');
                    updateFavoriteButton(mealId);
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

function updateFavoriteButton(mealId) {
    const user = firebase.auth().currentUser;
    if (user) {
        const userFavoritesRef = db.collection('users').doc(user.uid).collection('favorites');
        userFavoritesRef.doc(mealId).get().then(doc => {
            const button = document.querySelector(`.favorite-button[data-id="${mealId}"]`);
            if (button) {
                button.classList.toggle('favorited', doc.exists);
            }
        }).catch(error => {
            console.error('Error getting favorite:', error);
        });
    }
}

function addComment(mealId, comment, rating) {
    const user = firebase.auth().currentUser;
    if (user) {
        const mealCommentsRef = db.collection('meals').doc(mealId).collection('comments');
        mealCommentsRef.add({
            userId: user.uid,
            comment: comment,
            rating: rating,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            console.log('Comment added');
            displayComments(mealId);
        }).catch(error => {
            console.error('Error adding comment:', error);
        });
    } else {
        alert('Please log in to add a comment.');
    }
}

function displayComments(mealId) {
    const mealCommentsRef = db.collection('meals').doc(mealId).collection('comments').orderBy('timestamp', 'desc');
    mealCommentsRef.get().then(snapshot => {
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
    fetchCategories();
    fetchMeals('Beef');
    loadCarouselImages();
    auth.onAuthStateChanged(user => {
        if (user) {
            const userFavoritesRef = db.collection('users').doc(user.uid).collection('favorites');
            userFavoritesRef.onSnapshot(snapshot => {
                snapshot.docs.forEach(doc => {
                    updateFavoriteButton(doc.id);
                });
            });
        }
    });
});

document.getElementById('search-form').addEventListener('submit', event => {
    event.preventDefault();
    const query = document.getElementById('search-input').value;
    searchMeals(query);
});

window.fetchMealDetails = fetchMealDetails;
