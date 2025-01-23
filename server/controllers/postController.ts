import asyncHandler from 'express-async-handler';
import { Request, Response, NextFunction } from 'express';
import Post, { Ingredient, IPost, PostDocument } from '../models/postModel';
import User from '../models/userModel';
import {
	DIFFICULTY_OPTIONS,
	LANGUAGE_OPTIONS,
	POSTS_PAGE_SIZE,
} from '../utils/consts';
import { deleteFileFromPath } from '../utils/functions';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

interface PostWithCounts extends IPost {
	likeCount: number;
	commentCount: number;
}

const deleteUserPosts = async (userId: string): Promise<PostDocument[]> => {
	const posts = await Post.find({ user: userId });
	await Post.deleteMany({ user: userId });
	return posts;
};

const postsWithCounts = (posts: PostDocument[]): PostWithCounts[] => {
	return posts.map((post) => ({
		...post.toObject(),
		likeCount: post.likes.length,
		commentCount: post.comments.length,
	}));
};

const checkRequired = (
	title: string | undefined,
	ingredients: string | undefined,
	instructions: string | undefined,
	res: Response
) => {
	if (!title || !ingredients || !instructions) {
		res.status(400);
		throw new Error('Please fill all required fields');
	}

	const ingredients_object: Ingredient[] = JSON.parse(ingredients);
	const instructions_object: string[] = JSON.parse(instructions);

	if (!ingredients_object.length || !instructions_object.length) {
		res.status(400);
		throw new Error(
			'Instructions and ingredients must have at least one item'
		);
	}

	if (
		!ingredients_object.every((ingredient: Ingredient) => ingredient.name)
	) {
		res.status(400);
		throw new Error('Ingredients must have name');
	}

	if (!instructions_object.every((instruction: string) => instruction)) {
		res.status(400);
		throw new Error('Instructions must have content');
	}

	return { ingredients_object, instructions_object };
};

// Create Post
export const createPost = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const {
			title,
			description,
			ai,
			ingredients,
			instructions,
		}: {
			title: string;
			description: string;
			ai: boolean;
			ingredients: string;
			instructions: string;
		} = req.body;
		let images: string[] = [];
		if (req.files) {
			images = (req.files as Express.Multer.File[]).map(
				(file: Express.Multer.File) => file.path
			);
		}

		const { ingredients_object, instructions_object } = checkRequired(
			title,
			ingredients,
			instructions,
			res
		);

		const user = req.user!;
		const userId = user._id;

		const newPost = await Post.create({
			title,
			images,
			description,
			ingredients: ingredients_object,
			instructions: instructions_object,
			user: userId,
			ai,
		});

		res.status(201).json({
			success: true,
			post: newPost,
		});
	}
);

// Get Feed Posts (posts of users the user is following)
export const getFeedPosts = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { page } = req.query;
		const userId = req.user!.id;

		const user = await User.findById(userId).select('following');
		const followingIds = user?.following || [];

		const pageNumber = page ? Number(page) : 1;

		const count: number = await Post.find({
			user: { $in: followingIds },
		}).countDocuments();

		const feedPosts = await Post.find({ user: { $in: followingIds } })
			.sort({ createdAt: -1 })
			.limit(POSTS_PAGE_SIZE)
			.skip(POSTS_PAGE_SIZE * (pageNumber - 1))
			.populate('user', 'f_name _id picture gender l_name');

		const pages = Math.ceil(feedPosts.length / POSTS_PAGE_SIZE);

		const posts = postsWithCounts(feedPosts);

		res.status(200).json({
			success: true,
			cocktails: posts,
			count,
			pages,
		});
	}
);

export const createWithAI = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
		const { language, difficulty, ingredients } = req.body;
		let ingredients_object = ingredients;

		if (!language || !difficulty) {
			res.status(400);
			throw new Error('Please fill all required fields');
		}

		if (DIFFICULTY_OPTIONS.indexOf(difficulty) === -1) {
			res.status(400);
			throw new Error('Invalid difficulty');
		}

		if (LANGUAGE_OPTIONS.indexOf(language) === -1) {
			res.status(400);
			throw new Error('Invalid language');
		}

		if (!ingredients) {
			ingredients_object = [];
		}
		const model = genAI.getGenerativeModel({
			model: 'gemini-1.5-flash',
			generationConfig: {
				responseMimeType: 'application/json',
				responseSchema: {
					type: SchemaType.OBJECT,
					properties: {
						title: { type: SchemaType.STRING },
						description: { type: SchemaType.STRING },
						ingredients: {
							type: SchemaType.ARRAY,
							items: {
								type: SchemaType.OBJECT,
								properties: {
									name: { type: SchemaType.STRING },
									amount: {
										type: SchemaType.STRING,
									},
								},
							},
						},
						instructions: {
							type: SchemaType.ARRAY,
							items: {
								type: SchemaType.STRING,
							},
						},
					},
				},
			},
		});
		const prompt = `Create a cocktail recipe that is ${difficulty} difficulty level and includes ${ingredients_object.join(
			', '
		)} in ${language} language in JSON format`;
		const result = await model.generateContent(prompt);
		if (!ingredients) {
			ingredients_object = [];
		}
		const resultJSON: IPost = JSON.parse(result.response.text());

		// check if the result is valid
		// check if the result is valid

		if (
			!resultJSON.title ||
			!resultJSON.ingredients ||
			!resultJSON.instructions
		) {
			res.status(400);
			throw new Error('Failed to generate cocktail1');
		}

		if (!resultJSON.ingredients.length || !resultJSON.instructions.length) {
			res.status(400);
			throw new Error('Failed to generate cocktail2');
		}

		if (
			!resultJSON.ingredients.every(
				(ingredient: Ingredient) => ingredient.name
			)
		) {
			res.status(400);
			throw new Error('Failed to generate cocktail3');
		}

		if (
			!resultJSON.instructions.every((instruction: string) => instruction)
		) {
			res.status(400);
			throw new Error('Failed to generate cocktail4');
		}

		res.status(200).json({
			success: true,
			post: resultJSON,
		});
	}
);

// Get User Posts
export const getUserPosts = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { page } = req.query;
		const { userId } = req.params;

		const pageNumber = page ? Number(page) : 1;

		const count: number = await Post.find({
			user: userId,
		}).countDocuments();

		const userPosts = await Post.find({ user: userId })
			.limit(POSTS_PAGE_SIZE)
			.skip(POSTS_PAGE_SIZE * (pageNumber - 1))
			.populate('user', 'f_name _id picture gender l_name')
			.sort({ createdAt: -1 });

		const pages = Math.ceil(count / POSTS_PAGE_SIZE);

		const posts = postsWithCounts(userPosts);

		res.status(200).json({
			success: true,
			cocktails: posts,
			pages,
			count,
		});
	}
);

// Delete Post
export const deletePost = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { postId } = req.params;

		const post = await Post.findById(postId);
		if (!post) {
			res.status(404);
			throw new Error('post not found');
		}

		if (post.user.toString() !== req.user!.id) {
			res.status(401);
			throw new Error('You are not authorized to delete this post');
		}

		await Post.findByIdAndDelete(postId);

		res.status(200).json({
			success: true,
			message: 'post deleted successfully',
		});
		res.status(200).json({
			success: true,
			message: 'post deleted successfully',
		});
	}
);

// Update Post
export const updatePost = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { postId } = req.params;
		const {
			title,
			description,
			ingredients,
			instructions,
			deletedImages
		}: {
			title: string;
			description: string;
			ingredients: string;
			instructions: string;
			deletedImages: string;
		} = req.body;

		let images: string[] = [];
		if (req.files) {
			images = (req.files as Express.Multer.File[]).map(
				(file: Express.Multer.File) => file.path
			);
		}
		let deletedImagesArr: string[] = [];
		if (deletedImages) {
			deletedImagesArr = JSON.parse(deletedImages);
		}

		const { ingredients_object, instructions_object } = checkRequired(
			title,
			ingredients,
			instructions,
			res
		);

		const post = await Post.findById(postId);

		if (!post) {
			res.status(404);
			throw new Error('Post not found');
		}

		if (post.user.toString() !== req.user!.id) {
			res.status(401);
			throw new Error('You are not authorized to update this post');
		}

		post.title = title;
		post.description = description;
		post.ingredients = ingredients_object;
		post.instructions = instructions_object;
		post.images = [...post.images, ...images];
		post.images = post.images.filter((img) => !deletedImagesArr.includes(img));

		let promises: Promise<boolean>[] = [];
		deletedImagesArr.forEach((img: string) => {
			promises.push(deleteFileFromPath(img));
		});

		await Promise.all(promises);

		await post.save();

		res.status(200).json({
			success: true,
			post,
		});
	}
);

// Like/Unlike Post
export const likePost = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { postId } = req.params;
		const userId = req.user!.id;

		const post = await Post.findById(postId);

		if (!post) {
			res.status(404);
			throw new Error('Post not exist');
		}

		if (post.likes.includes(userId)) {
			// Unlike the post
			post.likes = post.likes.filter((id) => id.toString() !== userId);
		} else {
			// Like the post
			post.likes.push(userId);
		}

		await post.save();

		res.status(200).json({
			success: true,
		});
	}
);

// Get Post (with like and comment counts)
export const getPost = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { postId } = req.params;

		const post = await Post.findById(postId)
			.populate('user', 'f_name _id picture gender l_name')
			.populate('comments', 'content user createdAt');

		if (!post) {
			res.status(404);
			throw new Error('Post not found');
		}

		const postWithCounts: PostWithCounts = {
			...post.toObject(),
			likeCount: post.likes.length,
			commentCount: post.comments.length,
		};

		res.status(200).json({
			success: true,
			post: postWithCounts,
		});
	}
);

//search posts
export const searchPosts = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { query, page } = req.query; // מילה או ביטוי לחיפוש

		const queryS = query ? query.toString() : '';

		const pageNumber = page ? Number(page) : 1;

		const count: number = await Post.find({
			$or: [
				{ title: { $regex: queryS, $options: 'i' } },
				{ description: { $regex: queryS, $options: 'i' } },
				{ 'ingredients.name': { $regex: queryS, $options: 'i' } },
				{ instructions: { $regex: queryS, $options: 'i' } },
			],
		}).countDocuments();

		if (queryS.trim().length === 0) {
			res.status(400);
			throw new Error('Query parameter is required');
		}

		const searchResult = await Post.find({
			$or: [
				{ title: { $regex: queryS, $options: 'i' } },
				{ description: { $regex: queryS, $options: 'i' } },
				{ 'ingredients.name': { $regex: queryS, $options: 'i' } },
				{ instructions: { $regex: queryS, $options: 'i' } },
			],
		})
			.limit(POSTS_PAGE_SIZE)
			.skip(POSTS_PAGE_SIZE * (pageNumber - 1))
			.populate('user', 'f_name _id picture gender l_name') // Populate על משתמש
			.sort({ createdAt: -1 }); // מיון לפי זמן יצירה

		const pages = Math.ceil(count / POSTS_PAGE_SIZE);

		const posts = postsWithCounts(searchResult); // הוספת ספירת לייקים ותגובות

		res.status(200).json({
			success: true,
			cocktails: posts,
			count,
			pages,
		});
	}
);

export { deleteUserPosts };
