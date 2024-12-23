import request from 'supertest';
import app from '../server';
import { beforeAll, describe, expect, it } from '@jest/globals';
import { getUserId } from '../controllers/userController';
import jwt from 'jsonwebtoken';

process.env.NODE_ENV = 'test';

var userId: string,
	accessToken2: string,
	refreshToken: string,
	newUserId: string,
	invalidUserToken: string;

const user = {
	f_name: 'John',
	l_name: 'Doe',
	email: 'omerg.dev@gmail.com',
	password: 'Password123',
};

const noID = '6752d2e24222f986649b5809';

beforeAll(async () => {
	const res = await request(app).post('/api/user/login').send({
		email: process.env.TEST_EMAIL_USER_1,
		password: process.env.TEST_PASSWORD_USER_1,
	});
	userId = res.body.user._id;
	const randomMongoId = '60b0e6f4c9f8c72b1c1b3e7b';
	invalidUserToken = jwt.sign(
		{ id: randomMongoId },
		process.env.JWT_SECRET_REFRESH!
	);
});

describe('User routes Test', () => {
	it('should return 400 if required fields are missing - register', async () => {
		const res = await request(app)
			.post('/api/user/register')
			.field('f_name', '')
			.attach('picture', './tests/assets/test.jpeg');
		expect(res.statusCode).toEqual(400);
	});

	it('should return 400 if email is invalid  - register', async () => {
		const res = await request(app)
			.post('/api/user/register')
			.field('email', 'invalidMail')
			.field('f_name', user.f_name)
			.field('l_name', user.l_name)
			.field('password', user.password)
			.attach('picture', './tests/assets/test.jpeg');
		expect(res.statusCode).toEqual(400);
	});

	it('should return 400 if password is invalid  - register', async () => {
		const res = await request(app)
			.post('/api/user/register')
			.field('password', '123')
			.field('email', user.email)
			.field('f_name', user.f_name)
			.field('l_name', user.l_name)
			.attach('picture', './tests/assets/test.jpeg');
		expect(res.statusCode).toEqual(400);
	});

	it('should return 400 if email already exists  - register', async () => {
		const res = await request(app)
			.post('/api/user/register')
			.field('f_name', user.f_name)
			.field('l_name', user.l_name)
			.field('email', process.env.TEST_EMAIL_USER_1!)
			.field('password', user.password)
			.attach('picture', './tests/assets/test.jpeg');
		expect(res.statusCode).toEqual(400);
	});

	it('should return 201 if user created and email sent  - register', async () => {
		const res = await request(app)
			.post('/api/user/register')
			.field('f_name', user.f_name)
			.field('l_name', user.l_name)
			.field('email', user.email)
			.field('password', user.password)
			.attach('picture', './tests/assets/test.jpeg');
		expect(res.statusCode).toEqual(201);
		newUserId = await getUserId(user.email);
		expect(newUserId).toBeTruthy();
		expect(res.body.sent).toEqual(true);
	});

	it('should return 400 if user not verified - login', async () => {
		const res = await request(app).post('/api/user/login').send({
			email: user.email,
			password: user.password,
		});
		expect(res.statusCode).toEqual(400);
	});

	it('should return 400 if required fields are missing - login', async () => {
		const res = await request(app).post('/api/user/login').send({
			email: '',
			password: user.password,
		});
		expect(res.statusCode).toEqual(400);
	});

	it('should return 400 if email is invalid - login', async () => {
		const res = await request(app).post('/api/user/login').send({
			email: 'invalidMail',
			password: user.password,
		});
		expect(res.statusCode).toEqual(400);
	});

	it('should return 400 if user not found - login', async () => {
		const res = await request(app).post('/api/user/login').send({
			email: 'testUser213124@example.com',
			password: user.password,
		});
		expect(res.statusCode).toEqual(400);
	});

	it('should return 200 if email was sent - resend email', async () => {
		const res = await request(app).post('/api/user/resend').send({
			email: user.email,
		});

		expect(res.statusCode).toEqual(200);
		expect(res.body.sent).toEqual(true);
	});

	it('should return 200 if user was verified - verify user', async () => {
		const res = await request(app).get(`/api/user/verify/${newUserId}`);
		expect(res.statusCode).toEqual(200);
	});

	it('should return 400 if wrong password - login', async () => {
		const res = await request(app).post('/api/user/login').send({
			email: user.email,
			password: 'wrongPassword123',
		});
		expect(res.statusCode).toEqual(400);
	});

	it('should return 400 if no code provided - google', async () => {
		const res = await request(app).post('/api/user/google').send({});
		expect(res.statusCode).toEqual(400);
	});

	it('should return 200 if user was logged in - login', async () => {
		const res = await request(app).post('/api/user/login').send({
			email: user.email,
			password: user.password,
		});
		expect(res.statusCode).toEqual(200);
		accessToken2 = res.body.accessToken;
		refreshToken = res.body.refreshToken;
	});

	it('should return 400 if user was trying to follow himself - follow user', async () => {
		const res = await request(app)
			.get(`/api/user/follow/${newUserId}`)
			.set('Authorization', `Bearer ${accessToken2}`);
		expect(res.statusCode).toEqual(400);
	});

	it('should return 400 if user not found - follow user', async () => {
		const res = await request(app)
			.get(`/api/user/follow/${noID}`)
			.set('Authorization', `Bearer ${accessToken2}`);
		expect(res.statusCode).toEqual(400);
	});

	it('should return 200 if user followed another user - follow user', async () => {
		const res = await request(app)
			.get(`/api/user/follow/${userId}`)
			.set('Authorization', `Bearer ${accessToken2}`);
		expect(res.statusCode).toEqual(200);
	});

	it('should return 400 if already following user - follow user', async () => {
		const res = await request(app)
			.get(`/api/user/follow/${userId}`)
			.set('Authorization', `Bearer ${accessToken2}`);
		expect(res.statusCode).toEqual(400);
	});

	it('should return 400 if user was trying to unfollow himself - unfollow user', async () => {
		const res = await request(app)
			.get(`/api/user/unfollow/${newUserId}`)
			.set('Authorization', `Bearer ${accessToken2}`);
		expect(res.statusCode).toEqual(400);
	});

	it('should return 400 if user not found - unfollow user', async () => {
		const res = await request(app)
			.get(`/api/user/unfollow/${noID}`)
			.set('Authorization', `Bearer ${accessToken2}`);
		expect(res.statusCode).toEqual(400);
	});

	it('should return 200 if user unfollowed another user - unfollow user', async () => {
		const res = await request(app)
			.get(`/api/user/unfollow/${userId}`)
			.set('Authorization', `Bearer ${accessToken2}`);
		expect(res.statusCode).toEqual(200);
	});

	it('should return 400 if not following user - unfollow user', async () => {
		const res = await request(app)
			.get(`/api/user/unfollow/${userId}`)
			.set('Authorization', `Bearer ${accessToken2}`);
		expect(res.statusCode).toEqual(400);
	});

	it('should return 400 if user not found - verify user', async () => {
		const res = await request(app).get(`/api/user/verify/${noID}`);
		expect(res.statusCode).toEqual(400);
	});

	it('should return 400 if user already verified - verify user', async () => {
		const res = await request(app).get(`/api/user/verify/${newUserId}`);
		expect(res.statusCode).toEqual(400);
	});

	it('should return 404 if user not found - get user', async () => {
		const res = await request(app)
			.get('/api/user/' + noID)
			.set('Authorization', `Bearer ${accessToken2}`);
		expect(res.statusCode).toEqual(404);
	});

	it('should return 200 if user received - get user', async () => {
		const res = await request(app)
			.get('/api/user/' + userId)
			.set('Authorization', `Bearer ${accessToken2}`);
		expect(res.statusCode).toEqual(200);
	});

	it('should return 400 if required fields empty  - update user', async () => {
		const res = await request(app)
			.put('/api/user')
			.set('Authorization', `Bearer ${accessToken2}`)
			.field('f_name', '')
			.field('l_name', '')
			.attach('picture', './tests/assets/test.jpeg');
		expect(res.statusCode).toEqual(400);
	});

	it('should return 200 if user updated  - update user', async () => {
		const res = await request(app)
			.put('/api/user')
			.set('Authorization', `Bearer ${accessToken2}`)
			.field('f_name', 'John')
			.field('l_name', 'Smith')
			.attach('picture', './tests/assets/test.jpeg');
		expect(res.statusCode).toEqual(200);
		expect(res.body.user.l_name).toEqual('Smith');
	});

	it('should return 200 if user updated  - update user', async () => {
		const res = await request(app)
			.put('/api/user')
			.set('Authorization', `Bearer ${accessToken2}`)
			.field('f_name', 'John')
			.field('l_name', 'Smith')
			.field('deletePicture', true)
			.attach('picture', './tests/assets/test.jpeg');
		expect(res.statusCode).toEqual(200);
		expect(res.body.user.l_name).toEqual('Smith');
	});

	it('should return 400 if no refresh token is provided', async () => {
		const res = await request(app).post('/api/user/refresh').send();

		expect(res.statusCode).toEqual(400);
		expect(res.body.message).toBe('No refresh token provided.');
	});

	it('should return 400 if the refresh token is invalid', async () => {
		const invalidRefreshToken = 'invalidtoken123';

		const res = await request(app)
			.post('/api/user/refresh')
			.set('Authorization', `Bearer ${invalidRefreshToken}`)
			.expect(400);

		expect(res.body.message).toBe('Token failed');
	});

	it('should return 404 if user not found', async () => {
		const res = await request(app)
			.post('/api/user/refresh')
			.set('Authorization', `Bearer ${invalidUserToken}`);

		expect(res.statusCode).toEqual(404);
	});

	it('should return access token if valid refresh token is provided', async () => {
		const res = await request(app)
			.post('/api/user/refresh')
			.set('Authorization', `Bearer ${refreshToken}`)
			.send({});

		expect(res.statusCode).toEqual(200);
		expect(res.body.success).toBe(true);
		expect(res.body).toHaveProperty('accessToken');
		expect(res.body).toHaveProperty('refreshToken');
	});

	it('should return 401 if refresh token expired', async () => {
		const res = await request(app)
			.post('/api/user/refresh')
			.set('Authorization', `Bearer ${refreshToken}`)
			.send({});

		expect(res.statusCode).toEqual(401);
	});

	it('should return 400 if invalid email - resend email', async () => {
		const res = await request(app).post('/api/user/resend').send({
			email: 'invalidEmail',
		});
		expect(res.statusCode).toEqual(400);
	});

	it('should return 400 if invalid email - resend email', async () => {
		const res = await request(app).post('/api/user/resend').send({
			email: 'notfound@example.com',
		});
		expect(res.statusCode).toEqual(400);
	});

	it('should return 400 if user already verified - resend email', async () => {
		const res = await request(app).post('/api/user/resend').send({
			email: user.email,
		});
		expect(res.statusCode).toEqual(400);
	});

	it('should return 400 if no token provided - logout', async () => {
		const res = await request(app).post('/api/user/logout').send({});
		expect(res.statusCode).toEqual(400);
	});

	it('should return 400 if no token provided - logout', async () => {
		const res = await request(app)
			.post('/api/user/logout')
			.set('authorization', `Bearer ugwef2gou489gh23o4nfn28nif`)
			.send({});
		expect(res.statusCode).toEqual(400);
	});

	it('should return 404 if user not found - logout', async () => {
		const res = await request(app)
			.post('/api/user/logout')
			.set('authorization', `Bearer ${invalidUserToken}`)
			.send({});
		expect(res.statusCode).toEqual(404);
	});

	it('should return 401 if refresh token expired - logout', async () => {
		const res = await request(app)
			.post('/api/user/logout')
			.set('Authorization', `Bearer ${refreshToken}`)
			.send({});
		expect(res.statusCode).toEqual(401);
	});

	it('should return 200 if logged out - logout', async () => {
		const res1 = await request(app).post('/api/user/login').send({
			email: user.email,
			password: user.password,
		});
		const newRefreshToken = res1.body.refreshToken;
		const res = await request(app)
			.post('/api/user/logout')
			.set('Authorization', `Bearer ${newRefreshToken}`)
			.send({});
		expect(res.statusCode).toEqual(200);
	});

	it('should delete user - deleteUser', async () => {
		const res = await request(app)
			.delete('/api/user')
			.set('Authorization', `Bearer ${accessToken2}`);
		expect(res.statusCode).toEqual(200);
	});
});
