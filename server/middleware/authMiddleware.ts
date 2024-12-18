import jwt, { JwtPayload } from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel';
import { Request, Response, NextFunction } from 'express';

const authUser = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const authHeader = req.headers['authorization'];
		const token = authHeader && authHeader.split(' ')[1];

		if (!token) {
			res.status(401);
			throw new Error('Not authorized, no token');
		}
		let decoded;
		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
		} catch (error) {
			res.status(401);
			throw new Error('Not authorized, token failed');
		}

		const user = await User.findById(decoded.id);

		if (!user) {
			res.status(404);
			throw new Error('User not found');
		}

		req.user = user;

		next();
	}
);

export { authUser };
