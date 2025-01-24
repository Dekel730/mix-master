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
									type: 'string',
									description: 'Content of the comment',
									example: 'This is a great post!',
								},
								postId: {
									type: 'string',
									description: 'ID of the post',
									example: '63f6b5a7b67e2c001f4d9b5b',
								},
								parentComment: {
									type: 'string',
									description:
										'ID of the parent comment (if replying to a comment)',
									example: '63f6b5a7b67e2c001f4d9c2c',
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
										type: 'object',
										properties: {
											_id: {
												type: 'string',
												example:
													'63f6b5a7b67e2c001f4d9c2d',
											},
											content: {
												type: 'string',
												example:
													'This is a great post!',
											},
											user: {
												type: 'string',
												example:
													'63e2c001b4a8d3c001e4b7b6',
											},
											post: {
												type: 'string',
												example:
													'63f6b5a7b67e2c001f4d9b5b',
											},
											likes: {
												type: 'array',
												items: { type: 'string' },
												example: [],
											},
											parentComment: {
												type: 'string',
												nullable: true,
												example: null,
											},
											replies: {
												type: 'array',
												items: { type: 'string' },
												example: [],
											},
										},
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
											type: 'object',
											properties: {
												_id: {
													type: 'string',
													example:
														'63f6b5a7b67e2c001f4d9c2d',
												},
												content: {
													type: 'string',
													example:
														'This is a great post!',
												},
												repliesCount: {
													type: 'number',
													example: 2,
												},
												replies: {
													type: 'array',
													items: { type: 'object' },
													example: [],
												},
											},
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
	'/api/comment/{commentId}/like': {
		post: {
			tags: ['Comments'],
			summary: 'Like or unlike a comment',
			description: 'Toggle like status for a specific comment',
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
					description: 'Comment like toggled successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									comment: {
										type: 'object',
										properties: {
											_id: {
												type: 'string',
												example:
													'63f6b5a7b67e2c001f4d9c2d',
											},
											likes: {
												type: 'array',
												items: { type: 'string' },
												example: [
													'63e2c001b4a8d3c001e4b7b6',
												],
											},
										},
									},
								},
							},
						},
					},
				},
				...errorHandler(
					404,
					'Comment not found',
					'The specified comment does not exist'
				),
				...errorHandler(500, 'Some server error', 'Server error'),
			},
		},
	},
	'/api/comment/{commentId}/replies': {
		get: {
			tags: ['Comments'],
			summary: 'Get replies for a comment',
			description:
				'Retrieve replies for a specific comment with pagination support',
			security: [{ jwtAuth: [] }],
			parameters: [
				{
					in: 'path',
					name: 'commentId',
					required: true,
					schema: { type: 'string' },
					description: 'The ID of the comment',
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
					description: 'Replies retrieved successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									replies: {
										type: 'array',
										items: { type: 'object' },
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
					'Comment not found',
					'The specified comment does not exist'
				),
				...errorHandler(500, 'Some server error', 'Server error'),
			},
		},
	},
	'/api/comment/{commentId}': {
		put: {
			tags: ['Comments'],
			summary: 'Update a comment',
			description: 'Update the content of a specific comment',
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
			requestBody: {
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								content: {
									type: 'string',
									description:
										'Updated content of the comment',
									example: 'Updated comment content',
								},
							},
							required: ['content'],
						},
					},
				},
			},
			responses: {
				200: {
					description: 'Comment updated successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									comment: {
										type: 'object',
										properties: {
											_id: {
												type: 'string',
												example:
													'63f6b5a7b67e2c001f4d9c2d',
											},
											content: {
												type: 'string',
												example:
													'Updated comment content',
											},
										},
									},
								},
							},
						},
					},
				},
				...errorHandler(
					404,
					'Comment not found',
					'The specified comment does not exist'
				),
				...errorHandler(
					401,
					'Unauthorized',
					'You are not authorized to update this comment'
				),
				...errorHandler(500, 'Some server error', 'Server error'),
			},
		},
		delete: {
			tags: ['Comments'],
			summary: 'Delete a comment',
			description: 'Delete a specific comment',
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
					404,
					'Comment not found',
					'The specified comment does not exist'
				),
				...errorHandler(
					401,
					'Unauthorized',
					'You are not authorized to delete this comment'
				),
				...errorHandler(500, 'Some server error', 'Server error'),
			},
		},
	},
};

export default commentPaths;
