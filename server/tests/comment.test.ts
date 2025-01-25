import request from 'supertest';
import app from '../server';
import { describe, expect, it } from '@jest/globals';

process.env.NODE_ENV = 'test';

var commentId = '',
	replyId = '';
var content = 'test comment';
const noID = '6752d2e24222f986649b5809';

describe('Comment test', () => {
	//Create Comment
	it('should return 201 if comment created successfully - create comment', async () => {
		const res = await request(app)
			.post('/api/comment')
			.set('Authorization', `Bearer ${global.TestAccessToken}`)
			.send({
				postId: global.postId,
				content,
			});

		expect(res.statusCode).toEqual(201);
		expect(res.body).toHaveProperty('comment');
		expect(res.body.comment).toHaveProperty('_id');
		expect(res.body.comment.content).toEqual(content);
		commentId = res.body.comment._id;
		const res1 = await request(app)
			.post('/api/comment')
			.set('Authorization', `Bearer ${global.TestAccessToken}`)
			.send({
				postId: global.postId,
				content,
				parentComment: commentId,
			});
		replyId = res1.body.comment._id;
	});

	it('should return 400 if nested comment - create comment', async () => {
		const res = await request(app)
			.post('/api/comment')
			.set('Authorization', `Bearer ${global.TestAccessToken}`)
			.send({
				postId: global.postId,
				content,
				parentComment: replyId,
			});

		expect(res.statusCode).toEqual(400);
	});

	it('should return 400 if required fields', async () => {
		const res = await request(app)
			.post('/api/comment')
			.set('Authorization', `Bearer ${global.TestAccessToken}`);

		expect(res.statusCode).toEqual(400);
	});

	it('should return 404 if Post not found', async () => {
		const res = await request(app)
			.post('/api/comment')
			.set('Authorization', `Bearer ${global.TestAccessToken}`)
			.send({
				postId: noID,
				content,
			});
		expect(res.statusCode).toEqual(404);
	});

	it('should return 404 if parent comment not found', async () => {
		const res = await request(app)
			.post('/api/comment')
			.set('Authorization', `Bearer ${global.TestAccessToken}`)
			.send({
				postId: global.postId,
				content,
				parentComment: noID,
			});
		expect(res.statusCode).toEqual(404);
	});

	it('should return 404 if comment not found - get replies by comment', async () => {
		const res = await request(app)
			.get(`/api/comment/${noID}/replies`)
			.set('Authorization', `Bearer ${global.TestAccessToken}`);

		expect(res.statusCode).toEqual(404);
	});

	it('should return 200 if got replies by comment - get replies by comment', async () => {
		const res = await request(app)
			.get(`/api/comment/${commentId}/replies`)
			.set('Authorization', `Bearer ${global.TestAccessToken}`);

		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty('replies');
	});

	//get Comments By Post

	it('should return 200 if get comments by post successfully - get comments by post', async () => {
		const res = await request(app)
			.get('/api/comment/' + global.postId)
			.set('Authorization', `Bearer ${global.TestAccessToken}`);

		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty('comments');
	});

	//LikeComment

	it('should return 200 if comment liked successfully - Like comment', async () => {
		const res = await request(app)
			.post('/api/comment/' + commentId + '/like')
			.set('Authorization', `Bearer ${global.TestAccessToken}`);

		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty('comment');
		expect(res.body.comment).toHaveProperty('_id');
		expect(res.body.comment.likes).toContain(global.TestUserId);
		commentId = res.body.comment._id;
	});

	it('should return 404 if Comment not exist', async () => {
		const res = await request(app)
			.post('/api/comment/' + noID + '/like')
			.set('Authorization', `Bearer ${global.TestAccessToken}`)
			.send({
				content: 'updated content',
			});

		expect(res.statusCode).toEqual(404);
	});

	it('should return 200 if the comment was like successfully', async () => {
		const res = await request(app)
			.post('/api/comment/' + commentId + '/like')
			.set('Authorization', `Bearer ${global.TestAccessToken}`);

		expect(res.statusCode).toEqual(200);
	});

	it('should return 200 if the comment was unlike successfully', async () => {
		const res = await request(app)
			.post('/api/comment/' + commentId + '/like')
			.set('Authorization', `Bearer ${global.TestAccessToken}`);

		expect(res.statusCode).toEqual(200);
	});

	//DeleteComment
	it('should return 404 if Comment not found', async () => {
		const res = await request(app)
			.delete('/api/comment/' + noID)
			.set('Authorization', `Bearer ${global.TestAccessToken}`);

		expect(res.statusCode).toEqual;
	});

	it('should return 401 if You are not authorized to update this comment', async () => {
		const res = await request(app)
			.delete('/api/comment/' + commentId)
			.set('Authorization', `Bearer ${global.TestAccessToken2}`);

		expect(res.statusCode).toEqual(401);
	});

	it('should return 200 if comment deleted successfully - Delete comment', async () => {
		const res = await request(app)
			.delete('/api/comment/' + commentId)
			.set('Authorization', `Bearer ${global.TestAccessToken}`);

		expect(res.statusCode).toEqual(200);
	});
});
