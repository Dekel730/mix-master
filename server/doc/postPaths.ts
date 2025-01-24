import { errorHandler } from './components';

const postPaths = {
	'/api/post': {
		post: {
			tags: ['Posts'],
			summary: 'Create post',
			description: 'Create a new post',
			security: [{ jwtAuth: [] }],
			requestBody: {
				content: {
					'multipart/form-data': {
						schema: {
							type: 'object',
							properties: {
								title: {
									type: 'string',
									description: 'Title of the post',
								},
								description: {
									type: 'string',
									description: 'Description of the post',
								},
								images: {
									type: 'array',
									items: {
										type: 'string',
										format: 'uri',
									},
									description: 'Images for the post',
								},
								ingredients: {
									type: 'array',
									items: {
										type: 'object',
										properties: {
											name: { type: 'string' },
											amount: { type: 'string' },
										},
									},
									description: 'Ingredients used in the post',
								},
								instructions: {
									type: 'array',
									items: { type: 'string' },
									description: 'Instructions for the post',
								},
								ai: {
									type: 'boolean',
									description:
										'Whether the post was created by AI',
								},
							},
							required: ['title', 'ingredients', 'instructions'],
						},
					},
				},
			},
			responses: {
				201: {
					description: 'Post created successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									postId: {
										type: 'string',
										example: '612e5c5b1d8e1e001f4d9b5b',
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
				...errorHandler(500, 'Some server error', 'Server error'),
			},
		},
	},
	'/api/post/ai': {
		post: {
			tags: ['Posts'],
			summary: 'Create post with AI',
			description: 'Create a new post using AI',
			security: [{ jwtAuth: [] }],
			requestBody: {
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								title: { type: 'string' },
								description: { type: 'string' },
								ingredients: {
									type: 'array',
									items: {
										type: 'object',
										properties: {
											name: { type: 'string' },
											amount: { type: 'string' },
										},
									},
								},
								instructions: {
									type: 'array',
									items: { type: 'string' },
								},
							},
							required: ['title', 'ingredients', 'instructions'],
						},
					},
				},
			},
			responses: {
				201: {
					description: 'Post created with AI successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									postId: {
										type: 'string',
										example: '612e5c5b1d8e1e001f4d9b5b',
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
				...errorHandler(500, 'Some server error', 'Server error'),
			},
		},
	},
	'/api/post/feed': {
		get: {
			tags: ['Posts'],
			summary: 'Get feed posts',
			description: 'Retrieve posts for the feed',
			security: [{ jwtAuth: [] }],
			responses: {
				200: {
					description: 'Feed posts retrieved successfully',
					content: {
						'application/json': {
							schema: {
								type: 'array',
								items: {
									type: 'object',
									properties: {
										_id: {
											type: 'string',
											example: '612e5c5b1d8e1e001f4d9b5b',
										},
										title: {
											type: 'string',
											example: 'Delicious Recipe',
										},
										images: {
											type: 'array',
											items: { type: 'string' },
											example: [
												'https://image.com/post.jpg',
											],
										},
										likes: { type: 'number', example: 12 },
										comments: {
											type: 'number',
											example: 5,
										},
									},
								},
							},
						},
					},
				},
				...errorHandler(401, 'Unauthorized', 'Invalid credentials'),
				...errorHandler(500, 'Some server error', 'Server error'),
			},
		},
	},
	'/api/post/user/{userId}': {
		get: {
			tags: ['Posts'],
			summary: 'Get user posts',
			description: 'Retrieve posts created by a specific user',
			security: [{ jwtAuth: [] }],
			parameters: [
				{
					in: 'path',
					name: 'userId',
					required: true,
					schema: { type: 'string' },
					description: 'The user ID',
				},
			],
			responses: {
				200: {
					description: 'User posts retrieved successfully',
					content: {
						'application/json': {
							schema: {
								type: 'array',
								items: {
									type: 'object',
									properties: {
										_id: {
											type: 'string',
											example: '612e5c5b1d8e1e001f4d9b5b',
										},
										title: {
											type: 'string',
											example: 'Delicious Recipe',
										},
										likes: { type: 'number', example: 12 },
										comments: {
											type: 'number',
											example: 5,
										},
									},
								},
							},
						},
					},
				},
				...errorHandler(401, 'Unauthorized', 'Invalid credentials'),
				...errorHandler(500, 'Some server error', 'Server error'),
			},
		},
	},
	'/api/post/{postId}': {
		get: {
			tags: ['Posts'],
			summary: 'Get post by ID',
			description: 'Retrieve a specific post by its ID',
			security: [{ jwtAuth: [] }],
			parameters: [
				{
					in: 'path',
					name: 'postId',
					required: true,
					schema: { type: 'string' },
					description: 'The post ID',
				},
			],
			responses: {
				200: {
					description: 'Post retrieved successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									_id: {
										type: 'string',
										example: '612e5c5b1d8e1e001f4d9b5b',
									},
									title: {
										type: 'string',
										example: 'Delicious Recipe',
									},
									description: {
										type: 'string',
										example: 'A tasty and easy recipe',
									},
								},
							},
						},
					},
				},
				...errorHandler(
					404,
					'Post not found',
					'The post does not exist'
				),
				...errorHandler(500, 'Some server error', 'Server error'),
			},
		},
	},
	'/api/post/{postId}/like': {
		post: {
			tags: ['Posts'],
			summary: 'Like post',
			description: 'Like a specific post',
			security: [{ jwtAuth: [] }],
			parameters: [
				{
					in: 'path',
					name: 'postId',
					required: true,
					schema: { type: 'string' },
					description: 'The post ID',
				},
			],
			responses: {
				200: {
					description: 'Post liked successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									message: {
										type: 'string',
										example: 'Post liked successfully',
									},
								},
							},
						},
					},
				},
				...errorHandler(400, 'Invalid post ID', 'Invalid post ID'),
				...errorHandler(401, 'Unauthorized', 'Invalid credentials'),
				...errorHandler(500, 'Some server error', 'Server error'),
			},
		},
	},
	'/api/post/{postId}/delete': {
		delete: {
			tags: ['Posts'],
			summary: 'Delete post',
			description: 'Delete a specific post',
			security: [{ jwtAuth: [] }],
			parameters: [
				{
					in: 'path',
					name: 'postId',
					required: true,
					schema: { type: 'string' },
					description: 'The post ID',
				},
			],
			responses: {
				200: {
					description: 'Post deleted successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									message: {
										type: 'string',
										example: 'Post deleted successfully',
									},
								},
							},
						},
					},
				},
				...errorHandler(
					404,
					'Post not found',
					'Post with given ID not found'
				),
				...errorHandler(500, 'Some server error', 'Server error'),
			},
		},
	},
};
