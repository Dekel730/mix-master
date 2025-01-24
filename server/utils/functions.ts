import axios from 'axios';
import fs from 'fs';

export const sendEmail = async (
	receiver: string,
	subject: string,
	text: string,
	html?: string
): Promise<boolean> => {
	let result = false;
	try {
		const response = await axios.post(
			process.env.EMAIL_API_URL!,
			{
				receiver,
				subject,
				text,
				html,
			},
			{
				headers: {
					Authorization: `Bearer ${process.env.EMAIL_API_KEY}`,
				},
			}
		);
		if (response.data.success) {
			result = true;
		}
	} catch (error) {
		console.log(error);
		result = false;
	}

	return result;
};

export const isValidURL = (string: string): boolean => {
	try {
		new URL(string);
		return true;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (_: any) {
		return false;
	}
};

export const deleteFile = (
	file: Express.Multer.File | undefined
): Promise<boolean> => {
	if (!file) {
		return Promise.resolve(true);
	}
	return new Promise((resolve, reject) => {
		fs.unlink(file.path, (err) => {
			if (err) {
				resolve(false);
			}
			resolve(true);
		});
	});
};

export const deleteFiles = async (
	files: Express.Multer.File[] | undefined
): Promise<boolean> => {
	if (!files) {
		return Promise.resolve(true);
	}
	let promises: Promise<boolean>[] = [];
	files.forEach((file) => {
		promises.push(deleteFile(file));
	});
	return Promise.all(promises).then((values) => {
		return values.every((value) => value);
	});
};

export const deleteFileFromPath = (
	path: string | undefined
): Promise<boolean> => {
	if (!path) {
		return Promise.resolve(true);
	}
	if (isValidURL(path)) {
		return Promise.resolve(true);
	}
	return new Promise((resolve, reject) => {
		fs.unlink(path, (err) => {
			if (err) {
				resolve(false);
			}
			resolve(true);
		});
	});
};
