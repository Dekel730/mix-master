import e from 'express';
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
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								title: { type: 'string' },
								description: {
									type: 'array',
									items: { type: 'string' },
									description:
										'JSON stringified array of descriptions',
								},
								ai: { type: 'boolean' },
								ingredients: {
									type: 'array',
									items: {
										type: 'object',
										properties: {
											name: { type: 'string' },
											amount: { type: 'string' },
										},
									},
									description:
										'JSON stringified array of ingredients',
								},
								instructions: {
									type: 'array',
									items: { type: 'string' },
									description:
										'JSON stringified array of instructions',
								},
								images: {
									type: 'array',
									items: { type: 'file', format: 'binary' },
									description: 'Array of image files',
								},
							},
							required: [
								'title',
								'description',
								'ingredients',
								'instructions',
							],
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
									post: {
										type: 'object',
										example: {
											_id: '612e5c5b1d8e1e001f4d9b5b',
											title: 'Mojito',
											description:
												'A refreshing cocktail...',
											ai: false,
											ingredients: [
												{ name: 'Rum', amount: '50ml' },
												{
													name: 'Mint Leaves',
													amount: '10',
												},
											],
											instructions: [
												'Muddle mint',
												'Add rum',
												'Stir',
											],
											images: [
												'uploads/image1.jpg',
												'uploads/image2.jpg',
											],
											user: '601c5e5b1d8e1e001f4d9b5b',
											likes: [],
											comments: [],
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
					'All required fields must be provided'
				),
				...errorHandler(401, 'Unauthorized', 'Invalid credentials'),
				...errorHandler(500, 'Server error', 'Something went wrong'),
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
								language: { type: 'string' },
								difficulty: { type: 'string' },
								ingredients: {
									type: 'array',
									items: {
										type: 'object',
										properties: {
											name: { type: 'string' },
											amount: { type: 'string' },
										},
									},
									description:
										'JSON stringified array of ingredients',
								},
							},
							required: ['language', 'difficulty'],
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
									post: {
										type: 'object',
										properties: {
											title: { type: 'string' },
											description: { type: 'string' },
											ingredients: {
												type: 'array',
												items: {
													type: 'object',
													properties: {
														name: {
															type: 'string',
														},
														amount: {
															type: 'string',
														},
													},
												},
											},
											instructions: {
												type: 'array',
												items: { type: 'string' },
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
					'Language, difficulty, and ingredients are required'
				),
				...errorHandler(401, 'Unauthorized', 'Invalid credentials'),
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
								type: 'object',
								properties: {
									success: { type: 'boolean' },
									posts: {
										type: 'array',
										items: {
											$ref: '#/components/schemas/Post',
										},
									},
									count: { type: 'number' },
									pages: { type: 'number' },
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
								type: 'object',
								properties: {
									success: {
										type: 'boolean',
										description:
											'Indicates if the request was successful',
									},
									posts: {
										type: 'array',
										description: 'Array of user posts',
										items: {
											$ref: '#/components/schemas/Post',
										},
									},
									pages: {
										type: 'integer',
										description:
											'Total number of pages of posts',
									},
									count: {
										type: 'integer',
										description: 'Total number of posts',
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
		put: {
			tags: ['Posts'],
			summary: 'Update a post by ID',
			description: 'Update a specific post by its ID',
			security: [{ jwtAuth: [] }],
			parameters: [
				{
					in: 'path',
					name: 'postId',
					required: true,
					schema: { type: 'string' },
					description: 'Post ID',
				},
			],
			requestBody: {
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								title: { type: 'string' },
								description: {
									type: 'array',
									items: { type: 'string' },
									description:
										'JSON stringified array of descriptions',
								},
								ai: { type: 'boolean' },
								ingredients: {
									type: 'array',
									items: {
										type: 'object',
										properties: {
											name: { type: 'string' },
											amount: { type: 'string' },
										},
									},
									description:
										'JSON stringified array of ingredients',
								},
								instructions: {
									type: 'array',
									items: { type: 'string' },
									description:
										'JSON stringified array of instructions',
								},
								images: {
									type: 'array',
									items: { type: 'file', format: 'binary' },
									description: 'Array of image files',
								},
								deleteImages: {
									type: 'array',
									items: { type: 'string' },
								},
							},
						},
					},
				},
			},
			responses: {
				200: {
					description: 'Post updated successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									post: {
										type: 'object',
										$ref: '#/components/schemas/Post',
									},
								},
							},
						},
					},
				},
				...errorHandler(400, 'Invalid input', 'Invalid post ID'),
				...errorHandler(401, 'Unauthorized', 'Invalid credentials'),
				500: {
					description: 'Server error',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: {
										type: 'boolean',
										example: false,
									},
									message: {
										type: 'string',
										example:
											'Something went wrong on the server',
									},
								},
							},
						},
					},
				},
			},
		},
	},

	'/api/post/{postId}/like': {
		post: {
			tags: ['Posts'],
			summary: 'Like/Unlike post',
			description: 'Like or Unlike a specific post',
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
					description: 'Post liked/unliked successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
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
	'/api/post/search': {
		get: {
			tags: ['Posts'],
			summary: 'Search posts',
			description: 'Search for posts based on query parameters',
			security: [{ jwtAuth: [] }],
			parameters: [
				{
					in: 'query',
					name: 'query',
					required: true,
					schema: { type: 'string' },
					description:
						'Search query for post content (title, description, ingredients, instructions)',
				},
				{
					in: 'query',
					name: 'page',
					required: false,
					schema: { type: 'integer', default: 1 },
					description: 'Page number for pagination',
				},
			],
			responses: {
				200: {
					description: 'Posts found successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									posts: {
										type: 'array',
										items: {
											$ref: '#/components/schemas/Post',
										},
									},
									count: { type: 'integer', example: 50 },
									pages: { type: 'integer', example: 5 },
								},
							},
						},
					},
				},
				...errorHandler(
					400,
					'Invalid query',
					'Query parameter is required'
				),
				...errorHandler(401, 'Unauthorized', 'Invalid credentials'),
				...errorHandler(500, 'Some server error', 'Server error'),
			},
		},
	},

	'/api/post/{postId}/delete': {
		delete: {
			tags: ['Posts'],
			summary: 'Delete a specific post',
			description: 'Deletes a post by its ID',
			security: [{ jwtAuth: [] }],
			parameters: [
				{
					in: 'path',
					name: 'postId',
					required: true,
					schema: { type: 'string' },
					description: 'Post ID',
				},
			],
			responses: {
				'200': {
					description: 'The post was successfully deleted',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									message: {
										type: 'string',
										example:
											'The post was successfully deleted',
									},
								},
							},
						},
					},
				},
				'404': {
					description: 'Post not found',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: {
										type: 'boolean',
										example: false,
									},
									message: {
										type: 'string',
										example: 'Post not found',
									},
								},
							},
						},
					},
				},
				'401': {
					description:
						'You do not have permission to delete this post',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: {
										type: 'boolean',
										example: false,
									},
									message: {
										type: 'string',
										example:
											'You do not have permission to delete this post',
									},
								},
							},
						},
					},
				},
				'500': {
					description: 'Server error',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: {
										type: 'boolean',
										example: false,
									},
									message: {
										type: 'string',
										example: 'Server error',
									},
								},
							},
						},
					},
				},
			},
		},
	},
	'/api/post/{postId}/': {
		get: {
			tags: ['Posts'],
			summary: 'Get a specific post',
			description: 'Retrieves a post by its ID',
			security: [{ jwtAuth: [] }],
			parameters: [
				{
					in: 'path',
					name: 'postId',
					required: true,
					schema: { type: 'string' },
					description: 'The ID of the post to retrieve',
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
									success: { type: 'boolean', example: true },
									post: {
										type: 'object',
										$ref: '#/components/schemas/Post',
									},
								},
							},
						},
					},
				},
				...errorHandler(400, 'Invalid input', 'Invalid post ID'),
				...errorHandler(401, 'Unauthorized', 'Invalid credentials'),
				...errorHandler(404, 'Not found', 'Post not found'),
				...errorHandler(500, 'Server error', 'Something went wrong'),
			},
		},
	},
};

export default postPaths;
