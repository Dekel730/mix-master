import request from 'supertest';
import app from '../server';
import { beforeAll, describe, expect, it } from '@jest/globals';
import jwt from 'jsonwebtoken';

process.env.NODE_ENV = 'test';

var invalidUserToken: string;

beforeAll(async () => {
	const randomMongoId = '60b0e6f4c9f8c72b1c1b3e7b';
	invalidUserToken = jwt.sign(
		{ id: randomMongoId },
		process.env.JWT_SECRET!,
		{
			expiresIn: '1h',
		}
	);
});

describe('Middleware auth Test', () => {
	it('should return 401 if no token provided', async () => {
		const res = await request(app).put('/api/user').send({
			message: 'hey test',
		});
		expect(res.statusCode).toEqual(401);
	});

	it('should return 401 if token failed', async () => {
		const res = await request(app)
			.put('/api/user')
			.set('authorization', `Bearer 29874gf2f9gd2hbo3qnr892fgh`)
			.send({
				message: 'hey test',
			});
		expect(res.statusCode).toEqual(401);
	});

	it('should return 401 if no valid token', async () => {
		const res = await request(app)
			.put('/api/user')
			.set('authorization', '32801hrf0231nif09231fhji2n3f0in2')
			.send({
				message: 'hey test',
			});
		expect(res.statusCode).toEqual(401);
	});

	it('should return 404 if user not found', async () => {
		const res = await request(app)
			.put('/api/user')
			.set('authorization', `Bearer ${invalidUserToken}`)
			.send({
				message: 'hey test',
			});
		expect(res.statusCode).toEqual(404);
	});
});
