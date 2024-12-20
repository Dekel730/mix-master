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

export const deleteFile = (filePath: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		fs.unlink(filePath, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		});
	});
};
