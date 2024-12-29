import asyncHandler from "express-async-handler";
import { Message } from "./../../client/node_modules/postcss/lib/result.d";
import { Request, Response, NextFunction } from "express";
import Post, { PostDocument } from "../models/postModel";
import User from "../models/userModel";
import Comment from "../models/commentModel";

//! multiple posts - with likes and comments in numbers

// create post

// get feed posts (post of user following)

// get user posts

// delete post

// update post

// like/unlike post

// get post

const deleteUserPosts = async (userId: string): Promise<PostDocument[]> => {
    const posts = await Post.find({ user: userId });
    await Post.deleteMany({ user: userId });
    return posts;
};

// Create Post
export const createPost = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { title, description, ai } = req.body;
        let { ingredients, instructions } = req.body;

        ingredients = JSON.parse(ingredients);
        instructions = JSON.parse(instructions);

        if (
            !title ||
            !ingredients ||
            !ingredients.length ||
            !instructions ||
            !instructions.length
        ) {
            res.status(400);
            throw new Error("Please fill all required fields");
        }
        const user = req.user!;
        const userId = user._id;

        const newPost = await Post.create({
            title,
            description,
            ingredients,
            instructions,
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
        const userId = req.user!._id;

        const user = await User.findById(userId).select("following");
        const followingIds = user?.following || [];

        const feedPosts = await Post.find({ user: { $in: followingIds } })
            .sort({ createdAt: -1 })
            .populate("user", "username")
            .exec();

        const postsWithCounts = await Promise.all(
            feedPosts.map(async (post) => ({
                ...post.toObject(),
                likeCount: post.likes.length,
                commentCount: post.comments.length,
            }))
        );

        res.status(200).json({
            success: true,
            posts: postsWithCounts,
        });
    }
);

// Get User Posts
export const getUserPosts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { userId } = req.params;

    const userPosts = await Post.find({ user: userId })
        .sort({ createdAt: -1 })
        .exec();

    const postsWithCounts = userPosts.map((post) => ({
        ...post.toObject(),
        likeCount: post.likes.length,
        commentCount: post.comments.length,
    }));

    res.status(200).json({
        success: true,
        posts: postsWithCounts,
    });
};

// Delete Post
export const deletePost = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { postId } = req.params;

    const deletedPost = await Post.findByIdAndDelete(postId).exec();
    if (!deletedPost) throw new Error("Post not found");

    // res.status(200).json({ message: "Post deleted successfully" });
    res.status(200).json({
        success: true,
        post: deletedPost,
    });
};

// Update Post
export const updatePost = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { postId } = req.params;
    const { title, description, picture, ingredients, instructions } = req.body;

    const updatedPost = await Post.findByIdAndUpdate(
        postId,
        { title, description, picture, ingredients, instructions },
        { new: true }
    ).exec();

    if (!updatedPost) {
        res.status(404);
        throw new Error("Post not found");
    }

    //res.status(200).json(updatedPost);
    res.status(200).json({
        success: true,
        post: updatedPost,
    });
};

// Like/Unlike Post
export const likePost = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { postId } = req.params;
    const user = req.user!;
    const userId = user.id;

    const post = await Post.findById(postId);
    if (!post){
		res.status(404);
		throw new Error("Post not exist");
	} 

    if (post.likes.includes(userId)) {
        // Unlike the post
        post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
        // Like the post
        post.likes.push(userId);
    }

    await post.save();

    //res.status(200).json({ likeCount: post.likes.length });
    res.status(200).json({
        success: true,
        post: likePost.length,
    });
};

// Get Post (with like and comment counts)
export const getPost = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { postId } = req.params;

    const post = await Post.findById(postId)
        .populate("user", "username")
        .populate("comments", "content user createdAt") // Assumes Comment model has fields like this
        .exec();

    if (!post){
		res.status(404);
		throw new Error("Post not found");
	} 

    res.status(200).json({
        ...post.toObject(),
        likeCount: post.likes.length,
        commentCount: post.comments.length,
    });
};

export { deleteUserPosts };
