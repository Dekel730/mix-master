import { del } from './../../client/src/utils/requests';
import asyncHandler from 'express-async-handler';
import * as bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User, { Device, UserDocument } from '../models/userModel';
import { email_regex, password_regex } from '../utils/regex';
import { deleteFile, sendEmail } from '../utils/functions';
import {
	deletePostComments,
	deleteUserCommentsAndReplies,
} from './commentController';
import { deleteUserPosts } from './postController';
import { ObjectId } from 'mongoose';
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuid } from 'uuid';
import Post from '../models/postModel';

const createUserLogin = async (
	res: Response,
	user: UserDocument,
	device: Device
) => {
	const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
		expiresIn: '1h',
	});
	const refreshToken = jwt.sign(
		{ id: user._id },
		process.env.JWT_SECRET_REFRESH!
	);
	const token = user.tokens.find((t) => t.device_id === device.id);
	if (token) {
		const index = user.tokens.findIndex((t) => t.device_id === device.id);
		user.tokens[index] = {
			...token,
			token: refreshToken,
		};
	} else {
		user.tokens.push({
			token: refreshToken,
			device_id: device.id,
			createdAt: new Date(),
			name: device.name,
			type: device.type,
		});
	}
	await user.save();
	const userEx: UserDocument[] = await User.aggregate([
		{
			$match: { _id: user._id },
		},
		{
			$addFields: {
				followers: { $size: '$followers' }, // Compute the length of 'followers' array
				following: { $size: '$following' }, // Compute the length of 'following' array
			},
		},
		{
			$unset: ['password', '__v', 'resetPasswordToken'], // Exclude 'password' and '__v' fields
			// Add other fields you want to exclude in the array
		},
	]);
	res.json({
		success: true,
		user: {
			_id: userEx[0]._id,
			f_name: userEx[0].f_name,
			l_name: userEx[0].l_name,
			email: userEx[0].email,
			picture: userEx[0].picture,
			createdAt: userEx[0].createdAt,
			followers: userEx[0].followers,
			following: userEx[0].following,
		},
		accessToken,
		refreshToken,
	});
};

const login = asyncHandler(
	async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		const {
			email,
			password,
			device,
		}: {
			email: string;
			password: string;
			device: Device;
		} = req.body;
		if (!email || !password) {
			res.status(400);
			throw new Error('All fields are required');
		}
		if (!email_regex.test(email)) {
			res.status(400);
			throw new Error('Invalid email');
		}
		const user: UserDocument | null = await User.findOne({
			email: { $regex: new RegExp(`^${email}$`, 'i') },
		});
		if (!user) {
			res.status(400);
			throw new Error('Invalid email or password');
		}
		if (!user.isVerified) {
			res.status(400);
			throw new Error('Please verify your email');
		}
		const isMatch = await bcrypt.compare(password, user.password!);
		if (!isMatch) {
			res.status(400);
			throw new Error('Invalid email or password');
		}
		createUserLogin(res, user, device);
	}
);

const register = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const { f_name, l_name, email, password } = req.body;
		if (!f_name || !l_name || !email || !password) {
			if (req.file) {
				await deleteFile(req.file.path);
			}
			res.status(400);
			throw new Error('All fields are required');
		}
		if (!email_regex.test(email)) {
			if (req.file) {
				await deleteFile(req.file.path);
			}
			res.status(400);
			throw new Error('Invalid email');
		}
		if (!password_regex.test(password)) {
			if (req.file) {
				await deleteFile(req.file.path);
			}
			res.status(400);
			throw new Error(
				'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number'
			);
		}
		const userFound = await User.findOne({
			email: { $regex: new RegExp(`^${email}$`, 'i') },
		});
		if (userFound) {
			if (req.file) {
				await deleteFile(req.file.path);
			}
			res.status(400);
			throw new Error('User already exists');
		}
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		const user = new User({
			f_name,
			l_name,
			email,
			password: hashedPassword,
			picture: req.file ? req.file.path : undefined,
		});
		let promises: Promise<any>[] = [];
		promises.push(user.save());
		promises.push(
			sendEmail(
				email,
				'Verify your email',
				`please verify your email: ${process.env.HOST_ADDRESS}/verify/${user._id}`
			)
		);
		const [userSaved, sent] = await Promise.all(promises);
		res.status(201);
		res.json({
			success: true,
			message: 'User created successfully',
			sent,
		});
	}
);

const deleteUser = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const user = req.user!;
		const id = (user._id as ObjectId).toString();
		// delete all followers and following
		let promises: Promise<any>[] = [];
		promises.push(
			User.updateMany(
				{ _id: { $in: user.followers } },
				{ $pull: { following: id } }
			)
		);
		promises.push(
			User.updateMany(
				{ _id: { $in: user.following } },
				{ $pull: { followers: id } }
			)
		);
		promises.push(deleteUserPosts(id));
		if (user.picture) {
			promises.push(deleteFile(user.picture));
		}
		promises.push(deleteUserCommentsAndReplies(id));
		promises.push(User.findByIdAndDelete(id));
		const [_, _2, posts] = await Promise.all(promises);
		promises = [];
		for (let post of posts) {
			promises.push(deletePostComments(post._id));
		}
		await Promise.all(promises);
		res.json({
			success: true,
			message: 'User deleted successfully',
		});
	}
);

const followUser = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const user = req.user!;
		const { id } = req.params;
		if (id === (user._id as ObjectId).toString()) {
			res.status(400);
			throw new Error('Cannot follow yourself');
		}
		const userToFollow = await User.findById(id);
		if (!userToFollow) {
			res.status(400);
			throw new Error('User not found');
		}

		if (user.following.filter((f) => f.toString() === id).length > 0) {
			res.status(400);
			throw new Error('Already following user');
		}
		let promises: Promise<any>[] = [];
		promises.push(
			User.findByIdAndUpdate(user._id, { $push: { following: id } })
		);
		promises.push(
			User.findByIdAndUpdate(id, { $push: { followers: user._id } })
		);
		await Promise.all(promises);
		res.json({
			success: true,
			message: 'User followed successfully',
		});
	}
);

const unFollowUser = asyncHandler(async (req: Request, res: Response) => {
	const user = req.user!;
	const { id } = req.params;
	if (id === (user._id as ObjectId).toString()) {
		res.status(400);
		throw new Error('Cannot unfollow yourself');
	}
	const userToUnFollow = await User.findById(id);
	if (!userToUnFollow) {
		res.status(400);
		throw new Error('User not found');
	}
	if (user.following.filter((f) => f.toString() === id).length === 0) {
		res.status(400);
		throw new Error('Not following user');
	}
	let promises: Promise<any>[] = [];
	promises.push(
		User.findByIdAndUpdate(user._id, { $pull: { following: id } })
	);
	promises.push(
		User.findByIdAndUpdate(id, { $pull: { followers: user._id } })
	);
	await Promise.all(promises);
	res.json({
		success: true,
		message: 'User unFollowed successfully',
	});
});

const verifyEmail = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const { id } = req.params;
		const user = await User.findById(id);
		if (!user) {
			res.status(400);
			throw new Error('User not found');
		}
		if (user.isVerified) {
			res.status(400);
			throw new Error('Email already verified');
		}
		user.isVerified = true;
		await user.save();
		res.json({
			success: true,
			message: 'Email verified successfully',
		});
	}
);

const getUser = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const userReq = req.user!;
		const { id } = req.params;
		const user = await User.findById(id);
		if (!user) {
			res.status(404);
			throw new Error('User not found');
		}
		if (!user.isVerified) {
			res.status(400);
			throw new Error('User not found');
		}
		const self = (userReq._id as ObjectId).toString() === id;
		const isFollowing =
			userReq.following.find((f) => f.toString() === id) !== undefined;

		res.json({
			success: true,
			user: {
				_id: user._id,
				picture: user.picture,
				bio: user.bio,
				f_name: user.f_name,
				l_name: user.l_name,
				email: user.email,
				createdAt: user.createdAt,
				followers: user.followers.length,
				following: user.following.length,
				self,
				isFollowing,
			},
		});
	}
);

const getUserSettings = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const user = req.user!;
		res.json({
			success: true,
			user: {
				f_name: user.f_name,
				l_name: user.l_name,
				email: user.email,
				picture: user.picture,
				bio: user.bio,
				devices: user.tokens.map((t) => ({
					device_id: t.device_id,
					createdAt: t.createdAt,
					name: t.name,
					type: t.type,
				})),
			},
		});
	}
);

const updateUser = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const user = req.user!;
		const {
			f_name,
			l_name,
			deletePicture,
			bio,
		}: {
			f_name: string;
			l_name: string;
			deletePicture: string | undefined;
			bio?: string;
		} = req.body;
		if (!f_name || !l_name) {
			if (req.file) {
				await deleteFile(req.file.path);
			}
			res.status(400);
			throw new Error('First name and last name are required');
		}
		if (bio && bio.length > 250) {
			if (req.file) {
				await deleteFile(req.file.path);
			}
			res.status(400);
			throw new Error('Bio must be less than 250 characters');
		}
		let picture: string | null = user.picture;
		let deletePictureBool = deletePicture === 'true';
		if (req.file) {
			if (user.picture) {
				await deleteFile(user.picture);
			}
			picture = req.file.path;
		}
		if (deletePictureBool) {
			if (req.file) {
				await deleteFile(req.file.path);
			}
			if (user.picture) {
				await deleteFile(user.picture);
			}
			picture = null;
		}
		const userUpdated = await User.findByIdAndUpdate(
			user._id,
			{
				f_name,
				l_name,
				picture,
				bio,
			},
			{ new: true }
		);
		res.json({
			success: true,
			user: {
				_id: userUpdated!._id,
				f_name: userUpdated!.f_name,
				l_name: userUpdated!.l_name,
				email: userUpdated!.email,
				picture: userUpdated!.picture,
				createdAt: userUpdated!.createdAt,
				followers: userUpdated!.followers,
				following: userUpdated!.following,
				bio: userUpdated!.bio,
			},
		});
	}
);

const refresh = asyncHandler(async (req, res) => {
	const authHeader = req.headers['authorization'];
	const refreshToken = authHeader && authHeader.split(' ')[1];
	if (!refreshToken) {
		res.status(400);
		throw new Error('No refresh token provided.');
	}
	let decoded;
	try {
		decoded = jwt.verify(
			refreshToken,
			process.env.JWT_SECRET_REFRESH!
		) as JwtPayload;
	} catch (error) {
		res.status(400);
		throw new Error('Token failed');
	}

	const user = await User.findById(decoded.id);
	if (!user) {
		res.status(404);
		throw new Error('User not found');
	}
	if (!user.tokens.find((t) => t.token === refreshToken)) {
		user.tokens = [];
		await user.save();
		res.status(401);
		throw new Error('Invalid refresh token');
	}
	const device = user.tokens.find((t) => t.token === refreshToken)!;
	const accessToken: string = jwt.sign(
		{ id: decoded.id },
		process.env.JWT_SECRET!,
		{ expiresIn: '1h' }
	);

	const newRefreshToken: string = jwt.sign(
		{ id: decoded.id },
		process.env.JWT_SECRET_REFRESH!
	);

	const index = user.tokens.findIndex((t) => t.token === refreshToken);

	user.tokens[index] = { ...device, token: newRefreshToken };
	await user.save();

	res.json({
		success: true,
		accessToken,
		refreshToken: newRefreshToken,
	});
});

const logout = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const authHeader = req.headers['authorization'];
		const refreshToken = authHeader && authHeader.split(' ')[1];
		if (!refreshToken) {
			res.status(400);
			throw new Error('No refresh token provided.');
		}
		let decoded;
		try {
			decoded = jwt.verify(
				refreshToken,
				process.env.JWT_SECRET_REFRESH!
			) as JwtPayload;
		} catch (error) {
			res.status(400);
			throw new Error('Token failed');
		}
		const user = await User.findById(decoded.id);
		if (!user) {
			res.status(404);
			throw new Error('User not found');
		}
		if (!user.tokens.find((t) => t.token === refreshToken)) {
			user.tokens = [];
			await user.save();
			res.status(401);
			throw new Error('Invalid token');
		}
		user.tokens = user.tokens.filter((t) => t.token !== refreshToken);
		await user.save();
		res.json({
			success: true,
			message: 'Logged out successfully',
		});
	}
);

const resendEmail = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const { email } = req.body;
		if (!email_regex.test(email)) {
			res.status(400);
			throw new Error('Invalid email');
		}
		const user = await User.findOne({
			email: { $regex: new RegExp(`^${email}$`, 'i') },
		});
		if (!user) {
			res.status(400);
			throw new Error('User not found');
		}
		if (user.isVerified) {
			res.status(400);
			throw new Error('Email already verified');
		}
		const sent = await sendEmail(
			user.email,
			'Verify your email',
			`please verify your email: http://localhost:3000/verify/${user._id}`
		);
		res.json({
			success: true,
			sent,
		});
	}
);

const googleLogin = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const client = new OAuth2Client(
			process.env.GOOGLE_CLIENT_ID,
			process.env.GOOGLE_CLIENT_SECRET,
			'postmessage'
		);
		const {
			code,
			device,
		}: {
			code: string;
			device: Device;
		} = req.body;
		if (!code) {
			res.status(400);
			throw new Error('No code provided');
		}
		const response = await client.getToken(code);
		const ticket = await client.verifyIdToken({
			idToken: response.tokens.id_token!,
			audience: process.env.GOOGLE_CLIENT_ID!,
		});

		const payload = ticket.getPayload();
		if (!payload) {
			res.status(400);
			throw new Error('Invalid code');
		}

		const email = payload.email;
		if (!email) {
			res.status(400);
			throw new Error('Invalid email');
		}
		const user = await User.findOne({
			email: { $regex: new RegExp(`^${email}$`, 'i') },
		});
		if (!user) {
			// create user
			const password = uuid();
			const newUser = new User({
				f_name: payload.given_name,
				l_name: payload.family_name,
				email,
				password,
				picture: payload.picture,
				isVerified: true,
			});
			await newUser.save();
			createUserLogin(res, newUser, device);
		} else {
			if (!user.isVerified) {
				user.isVerified = true;
				await user.save();
			}
			createUserLogin(res, user, device);
		}
	}
);

const disconnectDevice = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const user = req.user!;
		const { id } = req.params;
		const device = user.tokens.find((t) => t.device_id === id);
		if (!device) {
			res.status(400);
			throw new Error('Device not found');
		}
		user.tokens = user.tokens.filter((t) => t.device_id !== id);
		await user.save();
		res.json({
			success: true,
			message: 'Device disconnected successfully',
		});
	}
);

const disconnectAllDevices = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const user = req.user!;
		user.tokens = [];
		await user.save();
		res.json({
			success: true,
			message: 'All devices disconnected successfully',
		});
	}
);

const getUserId = async (email: string): Promise<string> => {
	const user = await User.findOne({
		email: { $regex: new RegExp(`^${email}$`, 'i') },
	});
	if (!user) {
		return '';
	}
	return user._id.toString();
};

export {
	login,
	register,
	deleteUser,
	getUser,
	updateUser,
	refresh,
	googleLogin,
	resendEmail,
	verifyEmail,
	followUser,
	unFollowUser,
	getUserId,
	logout,
	getUserSettings,
	disconnectDevice,
	disconnectAllDevices,
};
