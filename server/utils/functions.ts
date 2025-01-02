import { createTransport } from 'nodemailer';
import fs from 'fs';

export const sendEmail = async (
	receiver: string,
	subject: string,
	text: string
): Promise<boolean> => {
	var transporter = createTransport({
		service: process.env.EMAIL_SERVICE,
		auth: {
			user: process.env.EMAIL_USERNAME,
			pass: process.env.EMAIL_PASSWORD,
		},
	});

	var mailOptions = {
		from: process.env.EMAIL_ADDRESS,
		to: receiver,
		subject: subject,
		text: text,
	};
	let success = false;
	await transporter
		.sendMail(mailOptions)
		.then(() => {
			success = true;
		})
		.catch((err) => {
			console.log(err);
			success = false;
		});
	return success;
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
