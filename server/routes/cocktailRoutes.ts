import {
	getRandomCocktails,
	searchIngredients,
	searchCocktails,
    getCocktailById
} from '../controllers/cocktailController';
import express from 'express';
import { authUser } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/random', authUser, getRandomCocktails);
router.get('/ingredients', authUser, searchIngredients);
router.get('/search', authUser, searchCocktails);
router.get('/:id', authUser, getCocktailById);

export default router;
