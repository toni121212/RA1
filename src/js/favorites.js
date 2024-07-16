document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = 'login.html';
        } else {
            displayFavoriteMeals(user.uid);
            displayFavoriteCocktails(user.uid);
        }
    });
});

function displayFavoriteMeals(userId) {
    const favoriteMealsDiv = document.getElementById('favorite-meals');

    db.collection('users').doc(userId).collection('favorites').where('type', '==', 'meal').get()
        .then(snapshot => {
            if (snapshot.empty) {
                favoriteMealsDiv.innerHTML = '<p>No favorite meals yet.</p>';
                return;
            }

            const mealPromises = snapshot.docs.map(doc => fetchMealById(doc.id));
            Promise.all(mealPromises)
                .then(meals => {
                    favoriteMealsDiv.innerHTML = meals.map(meal => `
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
                })
                .catch(error => console.error('Error fetching favorite meals:', error));
        })
        .catch(error => console.error('Error getting favorite meals from Firestore:', error));
}

function displayFavoriteCocktails(userId) {
    const favoriteCocktailsDiv = document.getElementById('favorite-cocktails');

    db.collection('users').doc(userId).collection('favorites').where('type', '==', 'cocktail').get()
        .then(snapshot => {
            if (snapshot.empty) {
                favoriteCocktailsDiv.innerHTML = '<p>No favorite cocktails yet.</p>';
                return;
            }

            const cocktailPromises = snapshot.docs.map(doc => fetchCocktailById(doc.id));
            Promise.all(cocktailPromises)
                .then(cocktails => {
                    favoriteCocktailsDiv.innerHTML = cocktails.map(cocktail => `
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
                })
                .catch(error => console.error('Error fetching favorite cocktails:', error));
        })
        .catch(error => console.error('Error getting favorite cocktails from Firestore:', error));
}

async function fetchMealById(mealId) {
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
        const data = await response.json();
        return data.meals[0];
    } catch (error) {
        console.error('Error fetching meal by ID:', error);
    }
}

async function fetchCocktailById(cocktailId) {
    try {
        const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${cocktailId}`);
        const data = await response.json();
        return data.drinks[0];
    } catch (error) {
        console.error('Error fetching cocktail by ID:', error);
    }
}

async function fetchMealDetails(mealId) {
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
        const data = await response.json();
        const meal = data.meals[0];
        const mealModalLabel = document.getElementById('mealModalLabel');
        const mealModalBody = document.getElementById('mealModalBody');
        
        if (!mealModalLabel || !mealModalBody) {
            throw new Error("Modal elements not found");
        }

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

function addComment(itemId, comment, rating) {
    const user = firebase.auth().currentUser;
    if (user) {
        const commentsRef = db.collection('items').doc(itemId).collection('comments');
        commentsRef.add({
            userId: user.uid,
            comment: comment,
            rating: rating,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            console.log('Comment added');
            displayComments(itemId);
        }).catch(error => {
            console.error('Error adding comment: ', error);
        });
    } else {
        alert('Please log in to add a comment.');
    }
}

function displayComments(itemId) {
    const commentsRef = db.collection('items').doc(itemId).collection('comments').orderBy('timestamp', 'desc');
    commentsRef.get().then(snapshot => {
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
