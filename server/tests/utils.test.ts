import { sendEmail, deleteFileFromPath, isValidURL } from '../utils/functions';
import { it, expect, describe } from '@jest/globals';

describe('util functions Test', () => {
	it('should return false if email was not sent successfully', async () => {
		const success = await sendEmail('', 'Subject', 'Body');
		expect(success).toEqual(false);
	});

	it('should return true if file is url and not need to be deleted', async () => {
		const success = await deleteFileFromPath('http://test.com');
		expect(success).toEqual(true);
	});

	it('should return true if its valid url', async () => {
		const success = isValidURL('http://test.com');
		expect(success).toEqual(true);
	});
});
