import express from "express";
import { authUser } from "../middleware/authMiddleware";
import {
    createComment,
    getCommentsByPost,
    updateComment,
    likeComment,
    deleteComment,
} from "../controllers/commentController";

const router = express.Router();

router.post("/", authUser, createComment);            //done
router.get("/:postId", authUser, getCommentsByPost);  //no
router.put("/:commentId", authUser, updateComment);  //done-1
router.post("/:commentId/like", authUser, likeComment); //done
router.delete("/:commentId", authUser, deleteComment); //no

export default router;
