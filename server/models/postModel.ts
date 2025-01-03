import * as mongoose from 'mongoose';

export interface IPost {
	title: string;
	description?: string;
	images: string[];
	ingredients: Ingredient[];
	instructions: string[];
	user: mongoose.Schema.Types.ObjectId;
	likes: mongoose.Schema.Types.ObjectId[];
	comments: mongoose.Schema.Types.ObjectId[];
	ai: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface Ingredient {
	name: string;
	amount: string;
}

const IngredientScheme = new mongoose.Schema<Ingredient>({
	name: {
		type: String,
		required: true,
	},
	amount: {
		type: String,
	},
});

const PostScheme = new mongoose.Schema<IPost>(
	{
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: false,
		},
		images: [
			{
				type: String,
				default: [],
			},
		],
		ingredients: [
			{
				type: IngredientScheme,
				required: true,
			},
		],
		instructions: [String],
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		likes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
				default: [],
			},
		],
		comments: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Comment',
				default: [],
			},
		],
		ai: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

export default mongoose.model<IPost>('Post', PostScheme);

export interface PostDocument extends IPost, mongoose.Document {}
