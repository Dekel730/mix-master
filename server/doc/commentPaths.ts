import { count } from 'console';
import { errorHandler } from './components';

const commentPaths = {
	'/api/comment': {
		post: {
			tags: ['Comments'],
			summary: 'Create a comment',
			description:
				'Create a new comment on a post or as a reply to another comment',
			security: [{ jwtAuth: [] }],
			requestBody: {
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								content: {
									$ref: '#/components/schemas/Comment/properties/content',
								},
								postId: {
									type: 'string',
									description: 'ID of the post',
									example: '63f6b5a7b67e2c001f4d9b5b',
								},
								parentComment: {
									$ref: '#/components/schemas/Comment/properties/parentComment',
								},
							},
							required: ['content', 'postId'],
						},
					},
				},
			},
			responses: {
				201: {
					description: 'Comment created successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									comment: {
										$ref: '#/components/schemas/Comment',
									},
								},
							},
						},
					},
				},
				...errorHandler(
					400,
					'Invalid input',
					'All fields are required'
				),
				...errorHandler(
					404,
					'Post not found',
					'The specified post does not exist'
				),
				...errorHandler(500, 'Some server error', 'Server error'),
			},
		},
	},
	'/api/comment/{postId}': {
		get: {
			tags: ['Comments'],
			summary: 'Get comments for a post',
			description:
				'Retrieve all comments for a specific post, including replies up to a limit',
			security: [{ jwtAuth: [] }],
			parameters: [
				{
					in: 'path',
					name: 'postId',
					required: true,
					schema: { type: 'string' },
					description: 'The ID of the post',
				},
				{
					in: 'query',
					name: 'page',
					required: false,
					schema: { type: 'integer', example: 1 },
					description: 'Page number for pagination',
				},
			],
			responses: {
				200: {
					description: 'Comments retrieved successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									comments: {
										type: 'array',
										items: {
											$ref: '#/components/schemas/Comment',
										},
									},
									count: { type: 'integer', example: 10 },
									pages: { type: 'integer', example: 2 },
								},
							},
						},
					},
				},
				...errorHandler(
					404,
					'Post not found',
					'The specified post does not exist'
				),
				...errorHandler(500, 'Some server error', 'Server error'),
			},
		},
	},
	'/api/comment/{commentId}': {
		delete: {
			tags: ['Comments'],
			summary: 'Delete a comment',
			description: 'Delete a comment by its ID',
			security: [{ jwtAuth: [] }],
			parameters: [
				{
					in: 'path',
					name: 'commentId',
					required: true,
					schema: { type: 'string' },
					description: 'The ID of the comment',
				},
			],
			responses: {
				200: {
					description: 'Comment deleted successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									message: {
										type: 'string',
										example: 'Comment deleted successfully',
									},
								},
							},
						},
					},
				},
				...errorHandler(
					401,
					'Unauthorized',
					'You are not authorized to delete this comment'
				),
				...errorHandler(
					404,
					'Comment not found',
					'The specified comment does not exist'
				),
			},
		},
	},
	'/api/comment/{commentId}/like': {
		post: {
			tags: ['Comments'],
			summary: 'Like a comment',
			description: 'Like a comment by its ID',
			security: [{ jwtAuth: [] }],
			parameters: [
				{
					in: 'path',
					name: 'commentId',
					required: true,
					schema: { type: 'string' },
					description: 'The ID of the comment',
				},
			],
			responses: {
				200: {
					description: 'Comment liked successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									message: {
										type: 'string',
										example: 'Comment liked successfully',
									},
								},
							},
						},
					},
				},
				...errorHandler(
					401,
					'Unauthorized',
					'You are not authorized to like this comment'
				),
				...errorHandler(
					404,
					'Comment not found',
					'The specified comment does not exist'
				),
			},
		},
	},
	'/api/comment/{commentId}/replies': {
		get: {
			tags: ['Comments'],
			summary: 'Get replies for a comment',
			description: 'Retrieve all replies for a specific comment',
			security: [{ jwtAuth: [] }],
			parameters: [
				{
					in: 'path',
					name: 'commentId',
					required: true,
					schema: { type: 'string' },
					description: 'The ID of the comment',
				},
			],
			responses: {
				200: {
					description: 'Replies retrieved successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									replies: {
										type: 'array',
										items: {
											$ref: '#/components/schemas/Comment',
										},
									},
									count: { type: 'integer', example: 5 },
									pages: { type: 'integer', example: 1 },
								},
							},
						},
					},
				},
				...errorHandler(
					401,
					'Unauthorized',
					'You are not authorized to view replies for this comment'
				),
				...errorHandler(
					404,
					'Comment not found',
					'The specified comment does not exist'
				),
			},
		},
	},
};
export default commentPaths;
