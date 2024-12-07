import * as mongoose from 'mongoose';

export interface IComment {
	user: mongoose.Schema.Types.ObjectId;
	post: mongoose.Schema.Types.ObjectId;
	content: string;
	likes: mongoose.Schema.Types.ObjectId[];
	parentComment: mongoose.Schema.Types.ObjectId | undefined;
	replies: mongoose.Schema.Types.ObjectId[];
}

const CommentScheme = new mongoose.Schema<IComment>(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		post: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Post',
			required: true,
		},
		content: {
			type: String,
			required: true,
		},
		likes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
				default: [],
			},
		],
		parentComment: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Comment',
		},
		replies: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Comment',
				default: [],
			},
		],
	},
	{ timestamps: true }
);

export default mongoose.model<IComment>('Comment', CommentScheme);

export interface CommentDocument extends IComment, mongoose.Document {}
