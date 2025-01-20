import asyncHandler from 'express-async-handler';
import axios from 'axios';

const transformCocktail = (cocktail: any) => {
	const ingredients = [];
	for (let i = 1; i <= 15; i++) {
		if (cocktail[`strIngredient${i}`]) {
			ingredients.push({
				name: cocktail[`strIngredient${i}`],
				amount: cocktail[`strMeasure${i}`],
			});
		}
	}
	return {
		title: cocktail.strDrink,
		_id: cocktail.idDrink,
		image: cocktail.strDrinkThumb,
		instructions: cocktail.strInstructions
			.split('.')
			.filter((instruction: string) => instruction.length > 0)
			.map((instruction: string) => instruction.trim()),
		ingredients,
		description: cocktail.strCategory,
	};
};

const getRandomCocktails = asyncHandler(async (req, res) => {
	try {
		const response = await axios.get(
			`https://www.thecocktaildb.com/api/json/v2/${process.env.COCKTAILS_API_KEY}/randomselection.php`
		);
		const cocktails = response.data.drinks.map(transformCocktail);
		res.json({
			success: true,
			cocktails,
		});
	} catch (error) {
		res.json({
			success: true,
			cocktails: [],
		});
	}
});

const searchCocktails = asyncHandler(async (req, res) => {
	const { name } = req.query;
	try {
		const response = await axios.get(
			`https://www.thecocktaildb.com/api/json/v2/${process.env.COCKTAILS_API_KEY}/search.php?s=${name}`
		);
		const cocktails = response.data.drinks.map(transformCocktail);
		res.json({
			success: true,
			cocktails,
		});
	} catch (error) {
		res.json({
			success: true,
			cocktails: [],
		});
	}
});

const searchIngredients = asyncHandler(async (req, res) => {
	const { name } = req.query;
	try {
		const response = await axios.get(
			`https://www.thecocktaildb.com/api/json/v2/${process.env.COCKTAILS_API_KEY}/list.php?i=list`
		);
		const ingredients = response.data.drinks
			.map((ingredient: any) => ingredient.strIngredient1)
			.filter((ingredient: string) =>
				ingredient.includes(name as string)
			);
		res.json({
			success: true,
			ingredients,
		});
	} catch (error) {
		res.json({
			success: true,
			ingredients: [],
		});
	}
});

const getCocktailById = asyncHandler(async (req, res) => {
	const { id } = req.params;
	try {
		const response = await axios.get(
			`https://www.thecocktaildb.com/api/json/v2/${process.env.COCKTAILS_API_KEY}/lookup.php?i=${id}`
		);
		const cocktail = response.data.drinks.map(transformCocktail)[0];
		res.json({
			success: true,
			cocktail,
		});
	} catch (error) {
		throw new Error('Cocktail not found');
	}
});

export {
	getRandomCocktails,
	searchIngredients,
	searchCocktails,
	getCocktailById,
};
