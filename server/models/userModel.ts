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
}

export interface IUser {
	f_name: string;
	l_name: string;
	email: string;
	bio?: string;
	password: string;
	isVerified: boolean;
	resetPasswordToken: string;
	picture: string;
	followers: mongoose.Schema.Types.ObjectId[];
	following: mongoose.Schema.Types.ObjectId[];
	createdAt?: Date;
	tokens: IToken[];
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
		picture: {
			type: String,
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
			},
		],
	},
	{ timestamps: true }
);

export default mongoose.model<IUser>('User', UserScheme);

export interface UserDocument extends IUser, mongoose.Document {}
