import asyncHandler from 'express-async-handler';
import { Request, Response, NextFunction } from 'express';
import Post, { IPost, PostDocument } from '../models/postModel';
import User from '../models/userModel';
import { POSTS_PAGE_SIZE } from '../utils/consts';

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

	const ingredients_object = JSON.parse(ingredients);
	const instructions_object = JSON.parse(instructions);

	if (!ingredients_object.length || !instructions_object.length) {
		res.status(400);
		throw new Error(
			'Instructions and ingredients must have at least one item'
		);
	}

	return [ingredients_object, instructions_object];
};

// Create Post
export const createPost = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { title, description, ai, ingredients, instructions } = req.body;

		const [ingredients_object, instructions_object] = checkRequired(
			title,
			ingredients,
			instructions,
			res
		);

		const user = req.user!;
		const userId = user._id;

		const newPost = await Post.create({
			title,
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
			.populate('user', 'f_name _id picture l_name');

		const pages = Math.ceil(feedPosts.length / POSTS_PAGE_SIZE);

		const posts = postsWithCounts(feedPosts);

		res.status(200).json({
			success: true,
			posts,
			count,
			pages,
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
			.populate('user', 'f_name _id picture l_name')
			.sort({ createdAt: -1 });

		const pages = Math.ceil(userPosts.length / POSTS_PAGE_SIZE);

		const posts = postsWithCounts(userPosts);

		res.status(200).json({
			success: true,
			posts,
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

		await Post.findByIdAndUpdate(postId);

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
		const { title, description, ingredients, instructions } = req.body;

		const [ingredients_object, instructions_object] = checkRequired(
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
		const user = req.user!;
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
			success: true
		});
	}
);

// Get Post (with like and comment counts)
export const getPost = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { postId } = req.params;

		const post = await Post.findById(postId)
			.populate('user', 'f_name _id picture l_name')
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

export { deleteUserPosts };
