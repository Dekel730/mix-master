import { errorHandler } from './components';

const userPaths = {
	'/api/user': {
		get: {
			tags: ['Users'],
			summary: 'Get user',
			description: 'Get user information',
			security: [{ jwtAuth: [] }],
			responses: {
				200: {
					description: 'User found',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: {
										type: 'boolean',
										example: true,
									},
									user: {
										type: 'object',
										properties: {
											_id: {
												type: 'string',
												example:
													'612e5c5b1d8e1e001f4d9b5b',
											},
											f_name: {
												type: 'string',
												example: 'John',
											},
											l_name: {
												type: 'string',
												example: 'Doe',
											},
											email: {
												type: 'string',
												example: 'johnD@gmail.com',
											},
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
		put: {
			tags: ['Users'],
			summary: 'Update user',
			description: 'Update user information',
			security: [{ jwtAuth: [] }],
			requestBody: {
				content: {
					'multipart/form-data': {
						schema: {
							type: 'object',
							properties: {
								f_name: {
									type: 'string',
									description: 'First name of the user',
								},
								l_name: {
									type: 'string',
									description: 'Last name of the user',
								},
								deletePicture: {
									type: 'boolean',
									description: 'Delete profile picture',
								},
								picture: {
									type: 'file',
									description: 'Profile picture of the user',
								},
							},
							required: ['f_name', 'l_name'],
						},
					},
				},
			},
			responses: {
				200: {
					description: 'User updated',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: {
										type: 'boolean',
										example: true,
									},
									message: {
										type: 'string',
										example: 'User updated successfully',
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
				...errorHandler(401, 'Unauthorized', 'Invalid credentials'),
				...errorHandler(500, 'Some server error', 'Server error'),
			},
		},
		delete: {
			tags: ['Users'],
			summary: 'Delete user',
			description: 'Delete user from the database',
			security: [{ jwtAuth: [] }],
			responses: {
				200: {
					description: 'User deleted',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: {
										type: 'boolean',
										example: true,
									},
									message: {
										type: 'string',
										example: 'User deleted successfully',
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
	'/api/user/login': {
		post: {
			tags: ['Users'],
			summary: 'Login user',
			description: 'Login user with email and password',
			requestBody: {
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								email: {
									type: 'string',
									format: 'email',
									description: 'Email address of the user',
								},
								password: {
									type: 'string',
									format: 'password',
									description: 'Password of the user',
								},
							},
							required: ['email', 'password'],
						},
					},
				},
			},
			responses: {
				200: {
					description: 'User logged in',
					headers: {
						authorization: {
							description: 'auth token',
							schema: {
								type: 'string',
							},
						},
					},
					cookies: {
						refreshToken: {
							description: 'refresh token',
							schema: {
								type: 'string',
							},
						},
					},
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: {
										type: 'boolean',
										example: true,
									},
									user: {
										type: 'object',
										properties: {
											_id: {
												type: 'string',
												example:
													'612e5c5b1d8e1e001f4d9b5b',
											},
											f_name: {
												type: 'string',
												example: 'John',
											},
											l_name: {
												type: 'string',
												example: 'Doe',
											},
											email: {
												type: 'string',
												example: 'johnD@gmail.com',
											},
											picture: {
												type: 'string',
												example:
													'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50',
											},
											followers: {
												type: 'number',
												example: 5,
											},
											following: {
												type: 'number',
												example: 10,
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
					'Invalid email or password',
					'Invalid email or password'
				),
				...errorHandler(401, 'Unauthorized', 'Invalid credentials'),
				...errorHandler(500, 'Some server error', 'Server error'),
			},
		},
	},
	'/api/user/register': {
		post: {
			tags: ['Users'],
			summary: 'Register user',
			description: 'Register user with email and password',
			requestBody: {
				content: {
					'multipart/form-data': {
						schema: {
							type: 'object',
							properties: {
								f_name: {
									type: 'string',
									description: 'First name of the user',
								},
								l_name: {
									type: 'string',
									description: 'Last name of the user',
								},
								email: {
									type: 'string',
									format: 'email',
									description: 'Email address of the user',
								},
								password: {
									type: 'string',
									format: 'password',
									description: 'Password of the user',
								},
								picture: {
									type: 'file',
									description: 'Profile picture of the user',
								},
							},
							required: ['f_name', 'l_name', 'email', 'password'],
						},
					},
				},
			},
			responses: {
				201: {
					description: 'User registered',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: {
										type: 'boolean',
										example: true,
									},
									message: {
										type: 'string',
										example: 'User registered successfully',
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
	'/api/user/refresh': {
		post: {
			tags: ['Users'],
			summary: 'Refresh token',
			description: 'Refresh token for user',
			parameters: [
				{
					in: 'cookie',
					name: 'refreshToken',
					required: true,
					schema: {
						type: 'string',
						description:
							'Refresh token stored as an HTTP-only cookie',
						example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
					},
				},
			],
			responses: {
				200: {
					description: 'Token refreshed',
					headers: {
						authorization: {
							description: 'auth token',
							schema: {
								type: 'string',
							},
						},
					},
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: {
										type: 'boolean',
										example: true,
									},
									message: {
										type: 'string',
										example: 'Token refreshed',
									},
									token: {
										type: 'boolean',
										example: true,
									},
								},
							},
						},
					},
				},
				...errorHandler(
					400,
					'Invalid Refresh Token',
					'No refresh token provided'
				),
				...errorHandler(500, 'Some server error', 'Server error'),
			},
		},
	},
	'/api/user/google': {
		post: {
			tags: ['Users'],
			summary: 'Google login',
			description: 'Login user with Google account',
			requestBody: {
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								tokenId: {
									type: 'string',
									description: 'Google token ID',
								},
							},
							required: ['tokenId'],
						},
					},
				},
			},
			responses: {
				200: {
					description: 'User logged in',
					headers: {
						authorization: {
							description: 'auth token',
							schema: {
								type: 'string',
							},
						},
					},
					cookies: {
						refreshToken: {
							description: 'refresh token',
							schema: {
								type: 'string',
							},
						},
					},
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: {
										type: 'boolean',
										example: true,
									},
									user: {
										type: 'object',
										properties: {
											_id: {
												type: 'string',
												example:
													'612e5c5b1d8e1e001f4d9b5b',
											},
											f_name: {
												type: 'string',
												example: 'John',
											},
											l_name: {
												type: 'string',
												example: 'Doe',
											},
											email: {
												type: 'string',
												example: 'JohnD@gmail.com',
											},
										},
									},
								},
							},
						},
					},
				},
				...errorHandler(400, 'Invalid token', 'Invalid token'),
				...errorHandler(401, 'Unauthorized', 'Invalid credentials'),
				...errorHandler(500, 'Some server error', 'Server error'),
			},
		},
	},
	'/api/user/resend': {
		post: {
			tags: ['Users'],
			summary: 'Resend verification email',
			description: 'Resend verification email to user',
			requestBody: {
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								email: {
									type: 'string',
									format: 'email',
									description: 'Email address of the user',
								},
							},
							required: ['email'],
						},
					},
				},
			},
			responses: {
				200: {
					description: 'Email sent',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: {
										type: 'boolean',
										example: true,
									},
									sent: {
										type: 'boolean',
										example: 'true',
									},
								},
							},
						},
					},
				},
				...errorHandler(400, 'Invalid input', 'Invalid email'),
				...errorHandler(500, 'Some server error', 'Server error'),
			},
		},
	},
	'/api/user/verify/{id}': {
		parameters: [
			{
				in: 'path',
				name: 'id',
				required: true,
				schema: {
					type: 'string',
				},
				description: 'The user ID',
			},
		],
		get: {
			tags: ['Users'],
			summary: 'Verify user email',
			description: 'Verify user email with user id',
			responses: {
				200: {
					description: 'User verified',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: {
										type: 'boolean',
										example: true,
									},
									message: {
										type: 'string',
										example: 'Email verified successfully',
									},
								},
							},
						},
					},
				},
				...errorHandler(400, 'Invalid input', 'Invalid id'),
				...errorHandler(500, 'Some server error', 'Server error'),
			},
		},
	},
	'/api/user/follow/{id}': {
		parameters: [
			{
				in: 'path',
				name: 'id',
				required: true,
				schema: {
					type: 'string',
				},
				description: 'The user ID',
			},
		],
		get: {
			tags: ['Users'],
			summary: 'Follow user',
			description: 'Follow user with user id',
			security: [
				{
					jwtAuth: [],
				},
			],
			responses: {
				200: {
					description: 'User followed',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: {
										type: 'boolean',
										example: true,
									},
									message: {
										type: 'string',
										example: 'User followed successfully',
									},
								},
							},
						},
					},
				},
				...errorHandler(400, 'Invalid input', 'Invalid id'),
				...errorHandler(401, 'Unauthorized', 'Invalid credentials'),
				...errorHandler(500, 'Some server error', 'Server error'),
			},
		},
	},
	'/api/user/unfollow/{id}': {
		parameters: [
			{
				in: 'path',
				name: 'id',
				required: true,
				schema: {
					type: 'string',
				},
				description: 'The user ID',
			},
		],
		get: {
			tags: ['Users'],
			summary: 'Unfollow user',
			description: 'Unfollow user with user id',
			security: [
				{
					jwtAuth: [],
				},
			],
			responses: {
				200: {
					description: 'User unfollowed',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: {
										type: 'boolean',
										example: true,
									},
									message: {
										type: 'string',
										example: 'User unfollowed successfully',
									},
								},
							},
						},
					},
				},
				...errorHandler(400, 'Invalid input', 'Invalid id'),
				...errorHandler(401, 'Unauthorized', 'Invalid credentials'),
				...errorHandler(500, 'Some server error', 'Server error'),
			},
		},
	},
};

export default userPaths;
