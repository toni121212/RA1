// Cargar y mostrar comidas y cócteles favoritos
document.addEventListener('DOMContentLoaded', () => {
    displayFavoriteMeals();
    displayFavoriteCocktails();
});

function displayFavoriteMeals() {
    const favorites = JSON.parse(localStorage.getItem('mealFavorites')) || [];
    const favoriteMealsDiv = document.getElementById('favorite-meals');

    if (favorites.length === 0) {
        favoriteMealsDiv.innerHTML = '<p>No favorite meals yet.</p>';
        return;
    }

    Promise.all(favorites.map(id => fetchMealById(id)))
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
}

function displayFavoriteCocktails() {
    const favorites = JSON.parse(localStorage.getItem('cocktailFavorites')) || [];
    const favoriteCocktailsDiv = document.getElementById('favorite-cocktails');

    if (favorites.length === 0) {
        favoriteCocktailsDiv.innerHTML = '<p>No favorite cocktails yet.</p>';
        return;
    }

    Promise.all(favorites.map(id => fetchCocktailById(id)))
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
