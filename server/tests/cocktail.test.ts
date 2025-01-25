import request from 'supertest';
import app from '../server';
import { describe, expect, it } from '@jest/globals';

process.env.NODE_ENV = 'test';

describe('Cocktail API', () => {
	var cocktailId = '';

	it('should return a list of cocktails - random cocktails', async () => {
		const res = await request(app)
			.get('/api/cocktail/random')
			.set('Authorization', `Bearer ${global.TestAccessToken}`);
		expect(res.statusCode).toEqual(200);
		expect(res.body.success).toBe(true);
		expect(res.body.cocktails.length).toBeGreaterThan(0);
		cocktailId = res.body.cocktails[0]._id;
	});

	it('should return a list of ingredients - search ingredients', async () => {
		const res = await request(app)
			.get('/api/cocktail/ingredients?name=whi')
			.set('Authorization', `Bearer ${global.TestAccessToken}`);
		expect(res.statusCode).toEqual(200);
		expect(res.body.success).toBe(true);
		expect(res.body.ingredients.length).toBeGreaterThan(0);
	});

	it('should return a list of cocktails - search cocktails', async () => {
		const res = await request(app)
			.get('/api/cocktail/search?name=margarita')
			.set('Authorization', `Bearer ${global.TestAccessToken}`);
		expect(res.statusCode).toEqual(200);
		expect(res.body.success).toBe(true);
		expect(res.body.cocktails.length).toBeGreaterThan(0);
	});

	it('should return a 404 - cocktail by id', async () => {
		const res = await request(app)
			.get(`/api/cocktail/1`)
			.set('Authorization', `Bearer ${global.TestAccessToken}`);
		expect(res.statusCode).toEqual(404);
	});

	it('should return 200 - cocktail by id', async () => {
		const res = await request(app)
			.get(`/api/cocktail/${cocktailId}`)
			.set('Authorization', `Bearer ${global.TestAccessToken}`);
		expect(res.statusCode).toEqual(200);
		expect(res.body.success).toBe(true);
		expect(res.body.cocktail._id).toBe(cocktailId);
	});
});
