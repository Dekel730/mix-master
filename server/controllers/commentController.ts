import Comment, { CommentDocument } from '../models/commentModel';
import asyncHandler from 'express-async-handler';
import { Request, Response, NextFunction } from 'express';
import Post from '../models/postModel';
import { MAX_COMMENTS_LIMIT, MAX_REPLIES_LIMIT } from '../utils/consts';
import { Schema } from 'mongoose';

// Create Comment
export const createComment = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = req.user!;
		const {
			content,
			postId,
			parentComment,
		}: { content: string; postId: string; parentComment?: string } =
			req.body;

		if (!content || !postId) {
			res.status(400);
			throw new Error('Please fill all required fields');
		}

		const post = await Post.findById(postId);

		if (!post) {
			res.status(404);
			throw new Error('Post not found');
		}

		let parentCommentDocument: CommentDocument | null = null;
		if (parentComment) {
			parentCommentDocument = await Comment.findById(parentComment);
			if (!parentCommentDocument) {
				res.status(404);
				throw new Error('Parent comment not found');
			}
		}

		const newComment = await Comment.create({
			user: user._id,
			post: postId,
			content,
			parentComment,
		}).then((comment) => {
			return comment.populate('user', 'f_name l_name gender picture');
		});

		if (parentCommentDocument) {
			parentCommentDocument!.replies.push(
				newComment._id as unknown as Schema.Types.ObjectId
			);
			await parentCommentDocument!.save();
		} else {
			post.comments.push(
				newComment._id as unknown as Schema.Types.ObjectId
			);
			await post.save();
		}

		res.status(201).json({
			success: true,
			comment: newComment,
		});
	}
);
// get Comments By Post
export const getCommentsByPost = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { page } = req.query;
		const { postId } = req.params;

		const pageN: number = page ? Number(page) : 1;

		const skip = (pageN - 1) * MAX_COMMENTS_LIMIT;
		const count: number = await Comment.find({
			post: postId,
			parentComment: null,
		}).countDocuments();

		const pages = Math.ceil(count / MAX_COMMENTS_LIMIT);

		const comments = await Comment.find({
			post: postId,
			parentComment: null,
		})
			.skip(skip)
			.limit(MAX_COMMENTS_LIMIT)
			.populate('user', 'f_name l_name picture gender')
			.populate({
				path: 'replies',
				populate: {
					path: 'user',
					select: 'f_name l_name picture gender likes',
				},
			});

		const commentsWithRepliesCount = comments.map((comment) => {
			const repliesCount = comment.replies.length;
			return {
				...comment.toObject(),
				repliesCount,
				replies: comment.replies.slice(0, MAX_REPLIES_LIMIT),
			};
		});

		res.status(200).json({
			success: true,
			comments: commentsWithRepliesCount,
			count,
			pages,
		});
	}
);

export const getRepliesByComment = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { commentId } = req.params;
		const { page } = req.query;

		const pageN: number = page ? Number(page) : 1;

		const skip = (pageN - 1) * MAX_REPLIES_LIMIT;

		const comment = await Comment.findById(commentId);

		if (!comment) {
			res.status(404);
			throw new Error('Comment not found');
		}

		const count: number = comment.replies.length;

		const pages = Math.ceil(count / MAX_REPLIES_LIMIT);

		const repliesIds = comment.replies.slice(
			skip,
			skip + MAX_REPLIES_LIMIT
		);

		const replies = await Comment.find({
			_id: { $in: repliesIds },
		}).populate('user', 'f_name l_name picture gender likes');

		res.status(200).json({ success: true, replies, count, pages });
	}
);

// UpdateComment
export const updateComment = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = req.user!;
		const { content }: { content: string } = req.body;
		const commentId = req.params.commentId;

		if (!content) {
			res.status(400);
			throw new Error('Please fill all required fields');
		}

		const comment = await Comment.findById(commentId);

		if (!comment) {
			res.status(404);
			throw new Error('Comment not found');
		}

		if (comment.user.toString() !== user.id) {
			res.status(401);
			throw new Error('You are not authorized to update this comment');
		}

		comment.content = content;
		await comment.save();

		res.status(200).json({
			success: true,
			comment,
		});
	}
);

//LikeComment
export const likeComment = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = req.user!;
		const commentId = req.params.commentId;

		const comment = await Comment.findById(commentId);

		if (!comment) {
			res.status(404);
			throw new Error('Comment not exist');
		}

		if (comment.likes.includes(user.id)) {
			// Unlike the post
			comment.likes = comment.likes.filter(
				(id) => id.toString() !== user.id
			);
		} else {
			// Like the post
			comment.likes.push(user.id);
		}

		await comment.save();

		res.status(200).json({
			success: true,
			comment,
		});
	}
);

//DeleteComment
export const deleteComment = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = req.user!;
		const commentId = req.params.commentId;

		const comment = await Comment.findById(commentId);

		if (!comment) {
			res.status(404);
			throw new Error('Comment not found');
		}

		if (comment.user.toString() !== user.id) {
			res.status(401);
			throw new Error('You are not authorized to update this comment');
		}

		await Comment.findByIdAndDelete(commentId);

		res.status(200).json({
			success: true,
			message: 'Comment deleted successfully',
		});
	}
);

// Delete User Comments and Replies
const deleteUserCommentsAndReplies = async (userId: string): Promise<void> => {
	let promises: Promise<any>[] = [];
	const userComments = await Comment.find({ user: userId });
	for (let comment of userComments) {
		for (let reply of comment.replies) {
			promises.push(Comment.findByIdAndDelete(reply));
		}
		promises.push(Comment.findByIdAndDelete(comment._id));
	}
	await Promise.all(promises);
};

// Delete Post Comments
const deletePostComments = async (postId: string): Promise<void> => {
	await Comment.deleteMany({ post: postId });
};

export { deleteUserCommentsAndReplies, deletePostComments };
