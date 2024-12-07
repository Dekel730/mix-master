import * as mongoose from 'mongoose';

export interface IPost {
	title: string;
	picture: string | undefined;
	ingredients: Ingredient[];
	instructions: Instructions[];
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
	ingredient: Ingredient[];
}

export interface Instructions {
	title: string;
	steps: string[];
}

const IngredientScheme = new mongoose.Schema<Ingredient>({
	name: {
		type: String,
		required: true,
	},
	amount: {
		type: String,
		required: true,
	},
	ingredient: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Ingredient',
		},
	],
});

const InstructionsScheme = new mongoose.Schema<Instructions>({
	title: {
		type: String,
		required: true,
	},
	steps: [
		{
			type: String,
			required: true,
		},
	],
});

const PostScheme = new mongoose.Schema<IPost>(
	{
		title: {
			type: String,
			required: true,
		},
		picture: {
			type: String,
		},
		ingredients: [
			{
				type: IngredientScheme,
				required: true,
			},
		],
		instructions: [
			{
				type: InstructionsScheme,
				required: true,
			},
		],
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
