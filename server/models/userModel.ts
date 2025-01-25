import * as mongoose from 'mongoose';

export interface Device {
	id: string;
	name: string;
	type: string;
}

export interface IToken {
	token: string;
	device_id: string;
	createdAt: Date;
	name: string;
	type: string;
	unique: string;
}

export interface IUser {
	f_name: string;
	l_name: string;
	email: string;
	bio?: string;
	password: string;
	isVerified: boolean;
	resetPasswordToken: string;
	resetPasswordTokenExpiry: Date | null;
	picture?: string;
	gender: 'Male' | 'Female' | 'Other';
	followers: mongoose.Schema.Types.ObjectId[];
	following: mongoose.Schema.Types.ObjectId[];
	createdAt?: Date;
	tokens: IToken[];
}

export interface IDevice {
	createdAt: Date;
	device_id: string;
	name: string;
	type: string;
}

export interface UserSettings {
	f_name: string;
	l_name: string;
	email: string;
	picture?: string;
	gender: 'Male' | 'Female' | 'Other';
	bio?: string;
	devices: IDevice[];
}

export interface UserDisplay {
	f_name: string;
	l_name: string;
	email: string;
	bio?: string;
	gender: 'Male' | 'Female' | 'Other';
	picture?: string;
	_id: string;
	createdAt: Date;
	following: number;
	followers: number;
	self: boolean;
	isFollowing: boolean;
}

export interface UserSearchResult {
	f_name: string;
	l_name: string;
	picture?: string;
	_id: string;
	gender: 'Male' | 'Female' | 'Other';
	createdAt: Date;
	following: number;
	followers: number;
}

export interface UserData {
	f_name: string;
	l_name: string;
	email: string;
	bio?: string;
	gender: 'Male' | 'Female' | 'Other';
	picture?: string;
	_id: string;
	createdAt: Date;
	following: number;
	followers: number;
}

const UserScheme = new mongoose.Schema<IUser>(
	{
		f_name: {
			type: String,
			required: true,
		},
		l_name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		bio: {
			type: String,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		resetPasswordToken: {
			type: String,
		},
		resetPasswordTokenExpiry: {
			type: Date,
		},
		picture: {
			type: String,
		},
		gender: {
			type: String,
			default: 'Other',
		},
		followers: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
			},
		],
		following: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
			},
		],
		tokens: [
			{
				token: {
					type: String,
					required: true,
				},
				device_id: {
					type: String,
				},
				createdAt: {
					type: Date,
				},
				name: {
					type: String,
				},
				type: {
					type: String,
				},
				unique: {
					type: String,
				},
			},
		],
	},
	{ timestamps: true }
);

UserScheme.index({ resetPasswordTokenExpiry: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IUser>('User', UserScheme, 'app_users');

export interface UserDocument extends IUser, mongoose.Document {}
