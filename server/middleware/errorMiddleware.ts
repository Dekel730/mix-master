import { NextFunction, Request, Response } from 'express';
import { deleteFile, deleteFiles } from '../utils/functions';

const errorHandler = async (
	err: Error,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const statusCode: number =
		res.statusCode && res.statusCode !== 200 && res.statusCode !== 201
			? res.statusCode
			: 500;
	if (process.env.NODE_ENV === 'development') {
		console.log(err.stack);
	}
	await deleteFiles(req.files as Express.Multer.File[] | undefined);
	await deleteFile(req.file);
	res.status(statusCode).json({
		message: err.message,
		stack: process.env.NODE_ENV === 'production' ? '(:' : err.stack,
	});
};

export default errorHandler;
