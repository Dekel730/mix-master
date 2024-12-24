import { beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../server';
import User from '../models/userModel';
import Post from '../models/postModel';
import Comment from '../models/commentModel';
import dotenv from 'dotenv';
import { getUserId } from '../controllers/userController';

dotenv.config();

// Define custom global variables with types
declare global {
	var TestRefreshToken: string;
	var TestUserId: string;
	var TestAccessToken: string;
}

// Initialize global variables
global.TestRefreshToken = '';
global.TestUserId = '';
global.TestAccessToken = '';

beforeAll(async () => {
	// erase all data from the database
	await User.deleteMany({});
	await Post.deleteMany({});
	await Comment.deleteMany({});
	const res = await request(app)
		.post('/api/user/register')
		.field('f_name', 'test')
		.field('l_name', 'test')
		.field('email', process.env.TEST_EMAIL_USER_1!)
		.field('password', process.env.TEST_PASSWORD_USER_1!)
		.attach('picture', './tests/assets/test.jpeg');

	const userId = await getUserId(process.env.TEST_EMAIL_USER_1!);
	const res2 = await request(app).get(`/api/user/verify/${userId}`);

	const res3 = await request(app)
		.post('/api/user/login')
		.send({
			email: process.env.TEST_EMAIL_USER_1!,
			password: process.env.TEST_PASSWORD_USER_1!,
			device: {
				id: '123',
				name: 'test',
				type: 'desktop',
			},
		});

	global.TestRefreshToken = res3.body.refreshToken;
	global.TestUserId = userId;
	global.TestAccessToken = res3.body.accessToken;
});
