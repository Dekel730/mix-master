import { sendEmail, deleteFile } from '../utils/functions';
import { it, expect, describe } from '@jest/globals';

describe('util functions Test', () => {
	it('should return false if email was not sent successfully', async () => {
		const success = await sendEmail('', 'Subject', 'Body');
		expect(success).toEqual(false);
	});
});
