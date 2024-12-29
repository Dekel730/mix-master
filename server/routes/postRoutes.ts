import express from "express";
import { authUser } from "../middleware/authMiddleware";
import {
    createPost,
    getFeedPosts,
    getUserPosts,
    deletePost,
    updatePost,
    likePost,
    getPost,
} from "../controllers/postController";
import upload from "../config/storage";

const router = express.Router();

router.post("/", authUser, upload.single("picture"), createPost);
router.get("/", authUser, getFeedPosts);
router.get("/:userId", authUser, getUserPosts);
router.delete("/:postId", authUser, deletePost);
router.put("/:postId", authUser, updatePost);
router.post("/:postId/like", authUser, likePost);
router.get("/:postId", authUser, getPost);

export default router;
