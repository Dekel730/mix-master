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
	resendEmail,
} from '../controllers/userController';
import upload from '../config/storage';

const router = express.Router();

router.post('/login', login);
router.post('/register', upload.single('picture'), register);
router.post('/refresh', refresh);
router.delete('/', authUser, deleteUser);
router.get('/', authUser, getUser);
router.put('/', authUser, upload.single('picture'), updateUser);
router.post('/google', googleLogin);
router.post('/resend', resendEmail);

export default router;
