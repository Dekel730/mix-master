import express from 'express';
import { authUser } from '../middleware/authMiddleware';
import {
	login,
	register,
	refresh,
	deleteUser,
	getUser,
	updateUser,
	googleLogin,
} from '../controllers/userController';
import upload from '../config/storage';

const router = express.Router();

router.post('/login', login);
router.post('/register', upload.single('file'), register);
router.post('/refresh', refresh);
router.delete('/', authUser, deleteUser);
router.get('/', authUser, getUser);
router.put('/', authUser, upload.single('file'), updateUser);
router.post('/google', googleLogin);

export default router;
