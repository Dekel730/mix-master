import request from 'supertest';
import app from '../server';
import { describe, expect, it } from '@jest/globals';

process.env.NODE_ENV = 'test';

var postId: string, images: string[];

const post = {
	title: 'Test Post',
	ingredients: [
		{
			name: 'Test Ingredient',
			amount: '1 cup',
		},
	],
	instructions: ['Step 1', 'Step 2'],
};

var noID = '6752d2e24222f986649b5809';

describe('posts test', () => {
	it('should return 201 if post created successfully - create post', async () => {
		const res = await request(app)
			.post('/api/post')
			.set('Authorization', `Bearer ${global.TestAccessToken}`)
			.field('title', post.title)
			.field('instructions', JSON.stringify(post.instructions))
			.field('ingredients', JSON.stringify(post.ingredients))
			.attach('images', './tests/assets/test.jpeg')
			.attach('images', './tests/assets/test.jpeg');

		expect(res.statusCode).toEqual(201);
		expect(res.body).toHaveProperty('post');
		expect(res.body.post).toHaveProperty('_id');
		expect(res.body.post.title).toEqual(post.title);
		postId = res.body.post._id;
		images = [res.body.post.images[0]];
	});

	it('should return 200 if returned posts - get feed posts', async () => {
		const res = await request(app)
			.get(`/api/post/`)
			.set('Authorization', `Bearer ${global.TestAccessToken}`);

		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty('cocktails');
		expect(res.body.cocktails).toBeInstanceOf(Array);
	});

	it('should return 200 if returned posts - get user posts', async () => {
		const res = await request(app)
			.get(`/api/post/user/${global.TestUserId}`)
			.set('Authorization', `Bearer ${global.TestAccessToken}`);

		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty('cocktails');
		expect(res.body.cocktails).toBeInstanceOf(Array);
	});

	it('should return 400 if no query - search posts', async () => {
		const res = await request(app)
			.get(`/api/post/search/`)
			.set('Authorization', `Bearer ${global.TestAccessToken}`);

		expect(res.statusCode).toEqual(400);
	});

	it('should return 200 if searched - search posts', async () => {
		const res = await request(app)
			.get(`/api/post/search/?query=gin`)
			.set('Authorization', `Bearer ${global.TestAccessToken}`);

		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty('cocktails');
		expect(res.body.cocktails).toBeInstanceOf(Array);
		expect(res.body.count).toBeGreaterThanOrEqual(0);
	});

	it('should return 400 if invalid input - create with AI', async () => {
		const res = await request(app)
			.post('/api/post/ai')
			.set('Authorization', `Bearer ${global.TestAccessToken}`)
			.send({});

		expect(res.statusCode).toEqual(400);
	});

	it('should return 400 if invalid difficulty - create with AI', async () => {
		const res = await request(app)
			.post('/api/post/ai')
			.set('Authorization', `Bearer ${global.TestAccessToken}`)
			.send({
				difficulty: 'nothing',
				language: 'en',
			});

		expect(res.statusCode).toEqual(400);
	});

	it('should return 400 if invalid language - create with AI', async () => {
		const res = await request(app)
			.post('/api/post/ai')
			.set('Authorization', `Bearer ${global.TestAccessToken}`)
			.send({
				difficulty: 'easy',
				language: 'nothing',
			});

		expect(res.statusCode).toEqual(400);
	});

	it('should return 200 if created post - create with AI', async () => {
		const res = await request(app)
			.post('/api/post/ai')
			.set('Authorization', `Bearer ${global.TestAccessToken}`)
			.send({
				difficulty: 'easy',
				language: 'English',
			});

		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty('post');
		expect(res.body.post).toHaveProperty('title');
	});

	it('should return 404 if post not found - update post', async () => {
		const res = await request(app)
			.put(`/api/post/${noID}`)
			.set('Authorization', `Bearer ${global.TestAccessToken}`)
			.field('title', post.title)
			.field('ingredients', JSON.stringify(post.ingredients))
			.field('instructions', JSON.stringify(post.instructions));

		expect(res.statusCode).toEqual(404);
	});

	it('should return 400 if invalid input - update post', async () => {
		const res = await request(app)
			.put(`/api/post/${postId}`)
			.set('Authorization', `Bearer ${global.TestAccessToken}`);

		expect(res.statusCode).toEqual(400);
	});

	it('should return 400 if invalid title - update post', async () => {
		const res = await request(app)
			.put(`/api/post/${postId}`)
			.set('Authorization', `Bearer ${global.TestAccessToken}`)
			.field('title', '')
			.field('ingredients', JSON.stringify(post.ingredients))
			.field('instructions', JSON.stringify(post.instructions));

		expect(res.statusCode).toEqual(400);
	});

	it('should return 400 if invalid ingredients - updatedPost', async () => {
		const res = await request(app)
			.put(`/api/post/${postId}`)
			.set('Authorization', `Bearer ${global.TestAccessToken}`)
			.field('title', post.title)
			.field('ingredients', JSON.stringify([{ name: '' }]))
			.field('instructions', JSON.stringify(['step1']));

		expect(res.statusCode).toEqual(400);
	});

	it('should return 400 if invalid instructions - updatedPost', async () => {
		const res = await request(app)
			.put(`/api/post/${postId}`)
			.set('Authorization', `Bearer ${global.TestAccessToken}`)
			.field('title', post.title)
			.field('ingredients', JSON.stringify([{ name: 'test 1' }]))
			.field('instructions', JSON.stringify(['']));

		expect(res.statusCode).toEqual(400);
	});

	it('should return 400 if invalid instructions or ingredients - update post', async () => {
		const res = await request(app)
			.put(`/api/post/${postId}`)
			.set('Authorization', `Bearer ${global.TestAccessToken}`)
			.field('title', post.title)
			.field('ingredients', JSON.stringify([]))
			.field('instructions', JSON.stringify([]));

		expect(res.statusCode).toEqual(400);
	});

	it('should return 401 if user not permitted to update - update post', async () => {
		const res = await request(app)
			.put(`/api/post/${postId}`)
			.set('Authorization', `Bearer ${global.TestAccessToken2}`)
			.field('title', post.title)
			.field('ingredients', JSON.stringify(post.ingredients))
			.field('instructions', JSON.stringify(post.instructions))
			.field('deletedImages', JSON.stringify(images))
			.attach('images', './tests/assets/test.jpeg');

		expect(res.statusCode).toEqual(401);
	});

	it('should return 200 if the post was updated successfully - update post', async () => {
		const res = await request(app)
			.put(`/api/post/${postId}`)
			.set('Authorization', `Bearer ${global.TestAccessToken}`)
			.field('title', post.title)
			.field('ingredients', JSON.stringify(post.ingredients))
			.field('instructions', JSON.stringify(post.instructions))
			.field('deletedImages', JSON.stringify(images))
			.attach('images', './tests/assets/test.jpeg');

		expect(res.statusCode).toEqual(200);
	});

	it('should return 404 if the Post not exist', async () => {
		const res = await request(app)
			.post(`/api/post/${noID}/like`)
			.set('Authorization', `Bearer ${global.TestAccessToken}`);

		expect(res.statusCode).toEqual(404);
	});
	//like post
	it('should return 200 if the post was like successfully', async () => {
		const res = await request(app)
			.post(`/api/post/${postId}/like`)
			.set('Authorization', `Bearer ${global.TestAccessToken}`);

		expect(res.statusCode).toEqual(200);
	});

	it('should return 200 if the post was unlike successfully', async () => {
		const res = await request(app)
			.post(`/api/post/${postId}/like`)
			.set('Authorization', `Bearer ${global.TestAccessToken}`);

		expect(res.statusCode).toEqual(200);
	});

	it('should return 404 if the Post is not found', async () => {
		const res = await request(app)
			.get(`/api/post/${noID}`)
			.set('Authorization', `Bearer ${global.TestAccessToken}`);

		expect(res.statusCode).toEqual(404);
	});

	it('should return 200 if the post was liked successfully', async () => {
		const res = await request(app)
			.get(`/api/post/${postId}`)
			.set('Authorization', `Bearer ${global.TestAccessToken}`);

		expect(res.statusCode).toEqual(200);
	});

	it('should return 404 if the Post not found', async () => {
		const res = await request(app)
			.delete(`/api/post/${noID}`)
			.set('Authorization', `Bearer ${global.TestAccessToken}`);

		expect(res.statusCode).toEqual(404);
	});

	it('should return 401 if user not permitted to delete - delete post', async () => {
		const res = await request(app)
			.delete(`/api/post/${postId}`)
			.set('Authorization', `Bearer ${global.TestAccessToken2}`);

		expect(res.statusCode).toEqual(401);
	});

	it('should return 200 if the post deleted successfully - delete post', async () => {
		const res1 = await request(app)
			.post('/api/comment')
			.set('Authorization', `Bearer ${global.TestAccessToken}`)
			.send({
				content: 'test comment',
				post: postId,
		});
		const res = await request(app)
			.delete(`/api/post/${postId}`)
			.set('Authorization', `Bearer ${global.TestAccessToken}`);

		expect(res.statusCode).toEqual(200);
	});
});
