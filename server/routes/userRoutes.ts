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
	followUser,
	unFollowUser,
	verifyEmail,
	logout,
	getUserSettings,
	disconnectAllDevices,
	disconnectDevice,
	changePassword,
	resetPassword,
	sendEmailPasswordReset,
	searchUsers,
} from '../controllers/userController';
import upload from '../config/storage';

const router = express.Router();

router.post('/login', login);
router.post('/register', upload.single('picture'), register);
router.post('/refresh', refresh);
router.route('/logout').post(logout);
router.put('/password', authUser, changePassword);
router.delete('/', authUser, deleteUser);
router.get('/', authUser, getUserSettings);
router.get('/verify/:id', verifyEmail);
router.get('/follow/:id', authUser, followUser);
router.get('/unfollow/:id', authUser, unFollowUser);
router.get('/disconnect/:id', authUser, disconnectDevice);
router.get('/disconnect', authUser, disconnectAllDevices);
router.get('/search', authUser, searchUsers);
router.get('/:id', authUser, getUser);
router.put('/', authUser, upload.single('picture'), updateUser);
router.post('/google', googleLogin);
router.post('/resend', resendEmail);
router.post('/forgot/email', sendEmailPasswordReset);
router.post('/forgot/password/:token/:email', resetPassword);

export default router;
