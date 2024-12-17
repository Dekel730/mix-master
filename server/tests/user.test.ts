import request from 'supertest';
import app from '../server';
import { beforeAll, describe, expect, it } from '@jest/globals';
import { getUserId } from '../controllers/userController';
import FormData from 'form-data';
import fs from 'fs';

process.env.NODE_ENV = 'test';

var accessToken1: string,
	userId: string,
	accessToken2: string,
	refreshToken: string,
	newUserId: string;

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
	accessToken1 = res.headers.authorization;
	userId = res.body.user._id;
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

	it('should return 200 if user was logged in - login', async () => {
		const res = await request(app).post('/api/user/login').send({
			email: user.email,
			password: user.password,
		});
		expect(res.statusCode).toEqual(200);
		accessToken2 = res.headers.authorization;
		refreshToken = res.headers['set-cookie'][0];
	});

	it('should return 400 if user was trying to follow himself - follow user', async () => {
		const res = await request(app)
			.get(`/api/user/follow/${newUserId}`)
			.set('Authorization', accessToken2);
		expect(res.statusCode).toEqual(400);
	});

	it('should return 400 if user not found - follow user', async () => {
		const res = await request(app)
			.get(`/api/user/follow/${noID}`)
			.set('Authorization', accessToken2);
		expect(res.statusCode).toEqual(400);
	});

	it('should return 200 if user followed another user - follow user', async () => {
		const res = await request(app)
			.get(`/api/user/follow/${userId}`)
			.set('Authorization', accessToken2);
		expect(res.statusCode).toEqual(200);
	});

	it('should return 400 if already following user - follow user', async () => {
		const res = await request(app)
			.get(`/api/user/follow/${userId}`)
			.set('Authorization', accessToken2);
		expect(res.statusCode).toEqual(400);
	});

	it('should return 400 if user was trying to unfollow himself - unfollow user', async () => {
		const res = await request(app)
			.get(`/api/user/unfollow/${newUserId}`)
			.set('Authorization', accessToken2);
		expect(res.statusCode).toEqual(400);
	});

	it('should return 400 if user not found - unfollow user', async () => {
		const res = await request(app)
			.get(`/api/user/unfollow/${noID}`)
			.set('Authorization', accessToken2);
		expect(res.statusCode).toEqual(400);
	});

	it('should return 200 if user unfollowed another user - unfollow user', async () => {
		const res = await request(app)
			.get(`/api/user/unfollow/${userId}`)
			.set('Authorization', accessToken2);
		expect(res.statusCode).toEqual(200);
	});

	it('should return 400 if not following user - unfollow user', async () => {
		const res = await request(app)
			.get(`/api/user/unfollow/${userId}`)
			.set('Authorization', accessToken2);
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

	it('should return 200 if user received - get user', async () => {
		const res = await request(app)
			.get('/api/user')
			.set('Authorization', accessToken2);
		expect(res.statusCode).toEqual(200);
	});

	it('should return 400 if required fields empty  - update user', async () => {
		const res = await request(app)
			.put('/api/user')
			.set('Authorization', accessToken2)
			.field('f_name', '')
			.field('l_name', '')
			.attach('picture', './tests/assets/test.jpeg');
		expect(res.statusCode).toEqual(400);
	});

	it('should return 200 if user updated  - update user', async () => {
		const res = await request(app)
			.put('/api/user')
			.set('Authorization', accessToken2)
			.field('f_name', 'John')
			.field('l_name', 'Smith')
			.attach('picture', './tests/assets/test.jpeg');
		expect(res.statusCode).toEqual(200);
		expect(res.body.user.l_name).toEqual('Smith');
	});

	it('should return 200 if user updated  - update user', async () => {
		const res = await request(app)
			.put('/api/user')
			.set('Authorization', accessToken2)
			.field('f_name', 'John')
			.field('l_name', 'Smith')
			.field('deletePicture', true)
			.attach('picture', './tests/assets/test.jpeg');
		expect(res.statusCode).toEqual(200);
		expect(res.body.user.l_name).toEqual('Smith');
	});

	it('should return 400 if no refresh token - refresh token', async () => {
		const res = await request(app).post('/api/user/refresh');
		expect(res.statusCode).toEqual(400);
	});

	it('should return 400 if invalid refresh token - refresh token', async () => {
		const res = await request(app)
			.post('/api/user/refresh')
			.set(
				'Cookie',
				'refreshToken=invalidToken ; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
			);
		expect(res.statusCode).toEqual(400);
	});

	it('should return 200 if user refreshed token - refresh token', async () => {
		const res = await request(app)
			.post('/api/user/refresh')
			.set('Cookie', refreshToken);
		expect(res.statusCode).toEqual(200);
		expect(res.headers.authorization).toBeDefined();
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

	it('should delete user - deleteUser', async () => {
		const res = await request(app)
			.delete('/api/user')
			.set('Authorization', accessToken2);
		expect(res.statusCode).toEqual(200);
	});
});
