import * as mongoose from 'mongoose';

export interface IUser {
	f_name: string;
	l_name: string;
	email: string;
	password: string;
	isVerified: boolean;
	resetPasswordToken: string;
	picture: string;
	followers: mongoose.Schema.Types.ObjectId[];
	following: mongoose.Schema.Types.ObjectId[];
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
	},
	{ timestamps: true }
);

export default mongoose.model<IUser>('User', UserScheme);

export interface UserDocument extends IUser, mongoose.Document {}
