import asyncHandler from 'express-async-handler';
import * as bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User, {
	Device,
	UserData,
	UserDisplay,
	UserDocument,
	UserSearchResult,
	UserSettings,
} from '../models/userModel';
import { email_regex, password_regex } from '../utils/regex';
import { sendEmail, deleteFileFromPath, deleteFile } from '../utils/functions';
import {
	deletePostComments,
	deleteUserCommentsAndReplies,
} from './commentController';
import { deleteUserPosts } from './postController';
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuid } from 'uuid';
import {
	GENDER_OPTIONS,
	MAX_BIO_LENGTH,
	MAX_USERS_LIMIT,
} from '../utils/consts';
import { ObjectId } from 'mongoose';

const getUserData = (user: UserDocument): UserData => ({
	_id: (user._id as ObjectId).toString(),
	f_name: user.f_name,
	l_name: user.l_name,
	email: user.email,
	picture: user.picture,
	createdAt: user.createdAt!,
	followers: user.followers.length,
	following: user.following.length,
	gender: user.gender,
});

const createUserLogin = async (
	res: Response,
	user: UserDocument,
	device: Device
) => {
	const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
		expiresIn: '1h',
	});
	const unique = uuid();
	const refreshToken = jwt.sign(
		{ id: user.id, device: device.id, unique },
		process.env.JWT_SECRET_REFRESH!
	);
	const hashedToken = await bcrypt.hash(refreshToken, 10);
	const token = user.tokens.find((t) => t.device_id === device.id);
	if (token) {
		const index = user.tokens.findIndex((t) => t.device_id === device.id);
		user.tokens[index] = {
			device_id: token.device_id,
			type: token.type,
			name: token.name,
			createdAt: token.createdAt,
			token: hashedToken,
			unique,
		};
	} else {
		user.tokens.push({
			token: hashedToken,
			device_id: device.id,
			createdAt: new Date(),
			name: device.name,
			type: device.type,
			unique,
		});
	}
	await user.save();
	const userData: UserData = getUserData(user);
	res.json({
		success: true,
		user: userData,
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
		if (
			!email ||
			!password ||
			!device ||
			!device.id ||
			!device.name ||
			!device.type
		) {
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
		await createUserLogin(res, user, device);
	}
);

const register = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const {
			f_name,
			l_name,
			email,
			password,
			gender,
		}: {
			f_name: string;
			l_name: string;
			email: string;
			password: string;
			gender: string;
		} = req.body;
		if (!f_name || !l_name || !email || !password) {
			res.status(400);
			throw new Error('All fields are required');
		}
		if (!email_regex.test(email)) {
			res.status(400);
			throw new Error('Invalid email');
		}
		if (!password_regex.test(password)) {
			res.status(400);
			throw new Error(
				'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number'
			);
		}
		if (GENDER_OPTIONS.indexOf(gender) === -1) {
			res.status(400);
			throw new Error('Invalid Gender');
		}
		const userFound = await User.findOne({
			email: { $regex: new RegExp(`^${email}$`, 'i') },
		});
		if (userFound) {
			res.status(400);
			throw new Error('User already exists');
		}
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		const user = new User({
			f_name,
			l_name,
			email,
			gender,
			password: hashedPassword,
			picture: req.file ? req.file.path : undefined,
		});
		let promises: Promise<any>[] = [];
		promises.push(user.save());
		const htmlContent = `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
				<img src="${process.env.HOST_ADDRESS}/logo.png" alt="Mix Master Logo" style="width: 100px; display: block; margin: 0 auto 20px;" />
				<h2 style="text-align: center; color: #333;">Verify Your Email</h2>
				<p>Hi,</p>
				<p>Thank you for signing up for Mix Master! Please verify your email address by clicking the button below:</p>
				<a href="${process.env.HOST_ADDRESS}/verify/${user._id}" 
					style="display: inline-block; background-color: #D93025; color: #fff; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
					Verify Email
				</a>
				<p>If you did not sign up for Mix Master, please ignore this email.</p>
				<p>Thanks,<br>The Mix Master Team</p>
			</div>
		`;
		promises.push(
			sendEmail(
				email,
				'Verify your email',
				`please verify your email: ${process.env.HOST_ADDRESS}/verify/${user._id}`,
				htmlContent
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
		const id = user.id;
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
		promises.push(deleteFileFromPath(user.picture));
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
		if (id === user.id) {
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
			User.findByIdAndUpdate(id, { $push: { followers: user.id } })
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
	if (id === user.id) {
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

const getUserDisplay = (
	userReq: UserDocument,
	user: UserDocument
): UserDisplay => {
	const isSelf = userReq.id === user.id;
	const isFollowing =
		userReq.following.find((f) => f.toString() === user.id) !== undefined;
	return {
		_id: user.id,
		picture: user.picture,
		bio: user.bio,
		f_name: user.f_name,
		l_name: user.l_name,
		email: user.email,
		gender: user.gender,
		createdAt: user.createdAt!,
		followers: user.followers.length,
		following: user.following.length,
		self: isSelf,
		isFollowing,
	};
};

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
			throw new Error('User not verified');
		}
		const userDisplay = getUserDisplay(userReq, user);
		res.json({
			success: true,
			user: userDisplay,
		});
	}
);

const getUserSettingsObject = (user: UserDocument): UserSettings => ({
	f_name: user.f_name,
	l_name: user.l_name,
	email: user.email,
	picture: user.picture,
	bio: user.bio,
	gender: user.gender,
	devices: user.tokens.map((t) => ({
		device_id: t.device_id,
		createdAt: t.createdAt,
		name: t.name,
		type: t.type,
	})),
});

const getUserSettings = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const user = req.user!;
		const userSettings = getUserSettingsObject(user);
		res.json({
			success: true,
			user: userSettings,
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
			gender,
		}: {
			f_name: string;
			l_name: string;
			deletePicture: string | undefined;
			bio?: string;
			gender: string;
		} = req.body;
		if (!f_name || !l_name || !gender) {
			res.status(400);
			throw new Error('First name and last name and gender are required');
		}
		if (bio && bio.length > MAX_BIO_LENGTH) {
			res.status(400);
			throw new Error('Bio must be less than 250 characters');
		}
		if (GENDER_OPTIONS.indexOf(gender) === -1) {
			res.status(400);
			throw new Error('Invalid Gender');
		}
		let picture: string | undefined | null = user.picture;
		let deletePictureBool = deletePicture === 'true';
		if (req.file) {
			await deleteFileFromPath(user.picture);
			picture = req.file.path;
		}
		if (deletePictureBool) {
			await deleteFile(req.file);
			await deleteFileFromPath(user.picture);
			picture = null;
		}
		const userUpdated = await User.findByIdAndUpdate(
			user._id,
			{
				f_name,
				l_name,
				picture,
				bio,
				gender,
			},
			{ new: true }
		);
		const userData: UserData = getUserData(userUpdated!);
		res.json({
			success: true,
			user: userData,
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
	const device = user.tokens.find((t) => t.device_id === decoded.device);
	if (!device) {
		res.status(401);
		throw new Error('Invalid refresh token');
	}
	if (
		!bcrypt.compareSync(refreshToken, device.token) ||
		device.unique !== decoded.unique
	) {
		user.tokens = [];
		await user.save();
		res.status(401);
		throw new Error('Invalid refresh token');
	}
	const accessToken: string = jwt.sign(
		{ id: decoded.id },
		process.env.JWT_SECRET!,
		{ expiresIn: '1h' }
	);

	const unique = uuid();

	const newRefreshToken: string = jwt.sign(
		{ id: decoded.id, device: device.device_id, unique },
		process.env.JWT_SECRET_REFRESH!
	);

	const newHashedToken = await bcrypt.hash(newRefreshToken, 10);

	const index = user.tokens.findIndex((t) => t.device_id === decoded.device);

	user.tokens[index] = {
		device_id: device.device_id,
		type: device.type,
		name: device.name,
		createdAt: device.createdAt,
		token: newHashedToken,
		unique,
	};
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
		const device = user.tokens.find((t) => t.device_id === decoded.device);
		if (!device) {
			res.status(401);
			throw new Error('Invalid token');
		}
		if (
			!bcrypt.compareSync(refreshToken, device.token) ||
			device.unique !== decoded.unique
		) {
			user.tokens = [];
			await user.save();
			res.status(401);
			throw new Error('Invalid refresh token');
		}
		user.tokens = user.tokens.filter((t) => t.device_id !== decoded.device);
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
		const htmlContent = `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
				<img src="${process.env.HOST_ADDRESS}/logo.png" alt="Mix Master Logo" style="width: 100px; display: block; margin: 0 auto 20px;" />
				<h2 style="text-align: center; color: #333;">Verify Your Email</h2>
				<p>Hi,</p>
				<p>Thank you for signing up for Mix Master! Please verify your email address by clicking the button below:</p>
				<a href="${process.env.HOST_ADDRESS}/verify/${user._id}" 
					style="display: inline-block; background-color: #D93025; color: #fff; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
					Verify Email
				</a>
				<p>If you did not sign up for Mix Master, please ignore this email.</p>
				<p>Thanks,<br>The Mix Master Team</p>
			</div>
		`;

		const sent = await sendEmail(
			user.email,
			'Verify your email',
			`please verify your email: ${process.env.HOST_ADDRESS}/verify/${user._id}`,
			htmlContent
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
		if (!device || !device.id || !device.name || !device.type) {
			res.status(400);
			throw new Error('Invalid device');
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
				gender: 'Other',
				email,
				password,
				picture: payload.picture,
				isVerified: true,
			});
			await newUser.save();
			await createUserLogin(res, newUser, device);
		} else {
			if (!user.isVerified) {
				user.isVerified = true;
				await user.save();
			}
			await createUserLogin(res, user, device);
		}
	}
);

const changePassword = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const user = req.user!;
		const { password } = req.body;
		if (!password) {
			res.status(400);
			throw new Error('Password is required');
		}
		if (!password_regex.test(password)) {
			res.status(400);
			throw new Error(
				'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number'
			);
		}
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		user.password = hashedPassword;
		await user.save();
		res.json({
			success: true,
			message: 'Password changed successfully',
		});
	}
);

const disconnectDevice = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const user = req.user!;
		const { id } = req.params;
		const device = user.tokens.find((t) => t.device_id === id);
		if (!device) {
			res.status(404);
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

const sendEmailPasswordReset = asyncHandler(
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
			res.status(404);
			throw new Error('User not found');
		}
		const token = uuid();
		const salt = await bcrypt.genSalt(10);
		const hashedToken = await bcrypt.hash(token, salt);
		user.resetPasswordToken = hashedToken;
		user.resetPasswordTokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
		await user.save();
		const htmlContent = `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
				<img src="${process.env.HOST_ADDRESS}/logo.png" alt="Mix Master Logo" style="width: 100px; display: block; margin: 0 auto 20px;" />
				<h2 style="text-align: center; color: #333;">Reset Your Password</h2>
				<p>Hi,</p>
				<p>We received a request to reset your password. You can reset it by clicking the link below:</p>
				<a href="${process.env.HOST_ADDRESS}/forgot/password/${token}/${email}" 
					style="display: inline-block; background-color: #D93025; color: #fff; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
					Reset Password
				</a>
				<p>If you did not request this, please ignore this email. The link will expire in 30 minutes.</p>
				<p>Thanks,<br>Mix Master Team</p>
			</div>
		`;

		const sent = await sendEmail(
			email,
			'Reset your password - Mix Master',
			`Reset your password: ${process.env.HOST_ADDRESS}/forgot/password/${token}/${email}`,
			htmlContent
		);

		res.json({
			success: true,
			sent,
			token: process.env.NODE_ENV === 'test' ? token : undefined,
		});
	}
);

const resetPassword = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const { token, email } = req.params;
		const { password } = req.body;
		if (!email_regex.test(email)) {
			res.status(400);
			throw new Error('Invalid email');
		}
		if (!password_regex.test(password)) {
			res.status(400);
			throw new Error(
				'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number'
			);
		}
		const user = await User.findOne({
			email: { $regex: new RegExp(`^${email}$`, 'i') },
		});
		if (!user) {
			res.status(400);
			throw new Error('Invalid token');
		}
		if (!user.resetPasswordToken) {
			res.status(400);
			throw new Error('Invalid token');
		}
		const isMatch = await bcrypt.compare(token, user.resetPasswordToken);
		if (!isMatch) {
			res.status(400);
			throw new Error('Invalid token');
		}
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		user.password = hashedPassword;
		user.resetPasswordToken = '';
		user.resetPasswordTokenExpiry = null;
		await user.save();
		res.json({
			success: true,
			message: 'Password changed successfully',
		});
	}
);

const searchUsersMap = (user: UserDocument): UserSearchResult => ({
	_id: user.id,
	f_name: user.f_name,
	l_name: user.l_name,
	picture: user.picture,
	gender: user.gender,
	createdAt: user.createdAt!,
	followers: user.followers.length,
	following: user.following.length,
});

const searchUsers = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const { query, page } = req.query; // מילה או ביטוי לחיפוש

		const queryS = query ? query.toString() : '';

		const pageNumber = page ? Number(page) : 1;

		if (queryS.trim().length === 0) {
			res.status(400);
			throw new Error('Query parameter is required');
		}
		const filter = {
			$and: [
				{ isVerified: true },
				{
					$or: [
						{ f_name: { $regex: queryS, $options: 'i' } },
						{ l_name: { $regex: queryS, $options: 'i' } },
						{ description: { $regex: queryS, $options: 'i' } },
					],
				},
			],
		};

		const count: number = await User.find(filter).countDocuments();

		const searchResult = await User.find(filter)
			.limit(MAX_USERS_LIMIT)
			.skip(MAX_USERS_LIMIT * (pageNumber - 1));

		const pages = Math.ceil(count / MAX_USERS_LIMIT);

		const users = searchResult.map(searchUsersMap);

		res.status(200).json({
			success: true,
			users,
			count,
			pages,
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
	return user.id;
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
	changePassword,
	sendEmailPasswordReset,
	resetPassword,
	searchUsers,
};
