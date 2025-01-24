import express from 'express';
import { authUser } from '../middleware/authMiddleware';
import {
	createComment,
	getCommentsByPost,
	likeComment,
	deleteComment,
	getRepliesByComment,
} from '../controllers/commentController';

const router = express.Router();

router.post('/', authUser, createComment);
router.get('/:postId', authUser, getCommentsByPost);
router.post('/:commentId/like', authUser, likeComment);
router.delete('/:commentId', authUser, deleteComment);
router.get('/:commentId/replies', authUser, getRepliesByComment);

export default router;
