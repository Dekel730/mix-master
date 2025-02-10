import { errorHandler } from './components';

const userPaths = {
	'/api/user': {
		get: {
			tags: ['Users'],
			summary: 'Get user settings',
			description: 'Get the authenticated user’s settings',
			security: [{ jwtAuth: [] }],
			responses: {
				200: {
					description: 'User settings found',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									user: {
										type: 'object',
										properties: {
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
												example: 'uploads/picture.jpg',
											},
											bio: {
												type: 'string',
												example: 'This is my bio.',
											},
											gender: {
												type: 'string',
												example: 'Male',
											},
											devices: {
												type: 'array',
												items: {
													type: 'object',
													properties: {
														device_id: {
															type: 'string',
															example:
																'device123',
														},
														createdAt: {
															type: 'string',
															format: 'date-time',
															example:
																'2021-08-31T12:34:56Z',
														},
														name: {
															type: 'string',
															example: 'Chrome',
														},
														type: {
															type: 'string',
															example: 'desktop',
														},
													},
												},
											},
										},
									},
								},
							},
						},
					},
				},
				...errorHandler(401, 'Unauthorized', 'Invalid credentials'),
				...errorHandler(500, 'Server error', 'Server error'),
			},
		},
		put: {
			tags: ['Users'],
			summary: 'Update user',
			description: 'Update the authenticated user’s information',
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
								gender: {
									type: 'string',
									description: 'Gender of the user',
									enum: ['Male', 'Female', 'Other'],
								},
								bio: {
									type: 'string',
									description: 'Bio of the user',
								},
								deletePicture: {
									type: 'boolean',
									description:
										'Set to true to delete the profile picture',
								},
								picture: {
									type: 'file',
									description: 'Profile picture of the user',
								},
							},
							required: ['f_name', 'l_name', 'gender'],
						},
					},
				},
			},
			responses: {
				200: {
					description: 'User updated successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
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
												example: 'uploads/picture.jpg',
											},
											createdAt: {
												type: 'string',
												format: 'date-time',
												example: '2021-08-31T12:34:56Z',
											},
											followers: {
												type: 'number',
												example: 10,
											},
											following: {
												type: 'number',
												example: 5,
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
					'First name, last name, and gender are required'
				),
				...errorHandler(401, 'Unauthorized', 'Invalid credentials'),
				...errorHandler(500, 'Server error', 'Server error'),
			},
		},
		delete: {
			tags: ['Users'],
			summary: 'Delete user',
			description: 'Delete the authenticated user from the database',
			security: [{ jwtAuth: [] }],
			responses: {
				200: {
					description: 'User deleted successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
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
				...errorHandler(500, 'Server error', 'Server error'),
			},
		},
	},
	'/api/user/{id}': {
		get: {
			tags: ['Users'],
			summary: 'Get user display information',
			description: 'Get public information for a user by their ID',
			security: [{ jwtAuth: [] }],
			parameters: [
				{
					in: 'path',
					name: 'id',
					required: true,
					schema: { type: 'string' },
					description: 'User ID',
				},
			],
			responses: {
				200: {
					description: 'User found',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									user: {
										type: 'object',
										properties: {
											_id: {
												type: 'string',
												example:
													'612e5c5b1d8e1e001f4d9b5b',
											},
											picture: {
												type: 'string',
												example: 'uploads/picture.jpg',
											},
											bio: {
												type: 'string',
												example: 'This is my bio.',
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
											gender: {
												type: 'string',
												example: 'Male',
											},
											createdAt: {
												type: 'string',
												format: 'date-time',
												example: '2021-08-31T12:34:56Z',
											},
											followers: {
												type: 'number',
												example: 5,
											},
											following: {
												type: 'number',
												example: 10,
											},
											self: {
												type: 'boolean',
												example: false,
											},
											isFollowing: {
												type: 'boolean',
												example: true,
											},
										},
									},
								},
							},
						},
					},
				},
				...errorHandler(404, 'Not Found', 'User not found'),
				...errorHandler(400, 'Bad Request', 'User not verified'),
				...errorHandler(500, 'Server error', 'Server error'),
			},
		},
	},
	'/api/user/login': {
		post: {
			tags: ['Users'],
			summary: 'Login user',
			description:
				'Login a user with email, password, and device information',
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
								device: {
									type: 'object',
									properties: {
										id: {
											type: 'string',
											example: 'device123',
										},
										name: {
											type: 'string',
											example: 'Chrome',
										},
										type: {
											type: 'string',
											example: 'desktop',
										},
									},
									required: ['id', 'name', 'type'],
								},
							},
							required: ['email', 'password', 'device'],
						},
					},
				},
			},
			responses: {
				200: {
					description: 'User logged in successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
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
												example: 'uploads/picture.jpg',
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
									accessToken: {
										type: 'string',
										description:
											'Access token for authentication',
									},
									refreshToken: {
										type: 'string',
										description:
											'Refresh token for obtaining new access tokens',
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
				...errorHandler(500, 'Server error', 'Server error'),
			},
		},
	},
	'/api/user/register': {
		post: {
			tags: ['Users'],
			summary: 'Register user',
			description:
				'Register a new user with first name, last name, email, password, gender and an optional profile picture',
			requestBody: {
				content: {
					'multipart/form-data': {
						schema: {
							type: 'object',
							properties: {
								f_name: {
									type: 'string',
									description: 'First name',
								},
								l_name: {
									type: 'string',
									description: 'Last name',
								},
								email: {
									type: 'string',
									format: 'email',
									description: 'Email address',
								},
								password: {
									type: 'string',
									format: 'password',
									description: 'Password',
								},
								gender: {
									type: 'string',
									description: 'Gender',
									enum: ['Male', 'Female', 'Other'],
								},
								picture: {
									type: 'file',
									description: 'Profile picture',
								},
							},
							required: [
								'f_name',
								'l_name',
								'email',
								'password',
								'gender',
							],
						},
					},
				},
			},
			responses: {
				201: {
					description:
						'User registered successfully and verification email sent',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									message: {
										type: 'string',
										example: 'User created successfully',
									},
									sent: { type: 'boolean', example: true },
								},
							},
						},
					},
				},
				...errorHandler(
					400,
					'Invalid input',
					'All fields are required or have an invalid format'
				),
				...errorHandler(500, 'Server error', 'Server error'),
			},
		},
	},
	'/api/user/refresh': {
		post: {
			summary: 'Refresh token',
			tags: ['Users'],
			security: [{ jwtAuth: [] }],
			responses: {
				200: {
					description: 'Token refreshed successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									accessToken: {
										type: 'string',
										description: 'New access token',
									},
									refreshToken: {
										type: 'string',
										description: 'New refresh token',
									},
								},
							},
						},
					},
				},
				...errorHandler(401, 'Invalid token', 'Token failed'),
				...errorHandler(404, 'Not Found', 'User not found'),
				...errorHandler(500, 'Server error', 'Server error'),
			},
		},
	},
	'/api/user/logout': {
		post: {
			summary: 'Logout user',
			tags: ['Users'],
			security: [{ jwtAuth: [] }],
			responses: {
				200: {
					description: 'User logged out successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									message: {
										type: 'string',
										example: 'Logged out successfully',
									},
								},
							},
						},
					},
				},
				...errorHandler(
					400,
					'Invalid input',
					'No refresh token provided'
				),
				...errorHandler(401, 'Unauthorized', 'Invalid token'),
				...errorHandler(404, 'Not Found', 'User not found'),
				...errorHandler(500, 'Server error', 'Server error'),
			},
		},
	},
	'/api/user/password': {
		put: {
			tags: ['Users'],
			summary: 'Change password',
			description: 'Change the password for the authenticated user',
			security: [{ jwtAuth: [] }],
			requestBody: {
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								password: {
									type: 'string',
									format: 'password',
									description: 'New password',
								},
							},
							required: ['password'],
						},
					},
				},
			},
			responses: {
				200: {
					description: 'Password changed successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									message: {
										type: 'string',
										example:
											'Password changed successfully',
									},
								},
							},
						},
					},
				},
				...errorHandler(
					400,
					'Invalid password',
					'Password is required or has an invalid format'
				),
				...errorHandler(401, 'Unauthorized', 'Invalid credentials'),
				...errorHandler(500, 'Server error', 'Server error'),
			},
		},
	},
	'/api/user/verify/{id}': {
		parameters: [
			{
				in: 'path',
				name: 'id',
				required: true,
				schema: { type: 'string' },
				description: 'User ID',
			},
		],
		get: {
			tags: ['Users'],
			summary: 'Verify email',
			description:
				'Verify the user’s email address using the provided user ID',
			responses: {
				200: {
					description: 'Email verified successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									message: {
										type: 'string',
										example: 'Email verified successfully',
									},
								},
							},
						},
					},
				},
				...errorHandler(
					400,
					'Invalid input',
					'Invalid id or email already verified'
				),
				...errorHandler(500, 'Server error', 'Server error'),
			},
		},
	},
	'/api/user/follow/{id}': {
		parameters: [
			{
				in: 'path',
				name: 'id',
				required: true,
				schema: { type: 'string' },
				description: 'ID of the user to follow',
			},
		],
		get: {
			tags: ['Users'],
			summary: 'Follow user',
			description: 'Follow a user by their ID',
			security: [{ jwtAuth: [] }],
			responses: {
				200: {
					description: 'User followed successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									message: {
										type: 'string',
										example: 'User followed successfully',
									},
								},
							},
						},
					},
				},
				...errorHandler(
					400,
					'Invalid input',
					'Cannot follow yourself or already following'
				),
				...errorHandler(401, 'Unauthorized', 'Invalid credentials'),
				...errorHandler(500, 'Server error', 'Server error'),
			},
		},
	},
	'/api/user/unfollow/{id}': {
		parameters: [
			{
				in: 'path',
				name: 'id',
				required: true,
				schema: { type: 'string' },
				description: 'ID of the user to unfollow',
			},
		],
		get: {
			tags: ['Users'],
			summary: 'Unfollow user',
			description: 'Unfollow a user by their ID',
			security: [{ jwtAuth: [] }],
			responses: {
				200: {
					description: 'User unfollowed successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									message: {
										type: 'string',
										example: 'User unfollowed successfully',
									},
								},
							},
						},
					},
				},
				...errorHandler(
					400,
					'Invalid input',
					'Not following user or invalid id'
				),
				...errorHandler(401, 'Unauthorized', 'Invalid credentials'),
				...errorHandler(500, 'Server error', 'Server error'),
			},
		},
	},
	'/api/user/disconnect/{id}': {
		parameters: [
			{
				in: 'path',
				name: 'id',
				required: true,
				schema: { type: 'string' },
				description: 'Device ID to disconnect',
			},
		],
		get: {
			tags: ['Users'],
			summary: 'Disconnect device',
			description:
				'Disconnect a specific device by its ID for the authenticated user',
			security: [{ jwtAuth: [] }],
			responses: {
				200: {
					description: 'Device disconnected successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									message: {
										type: 'string',
										example:
											'Device disconnected successfully',
									},
								},
							},
						},
					},
				},
				...errorHandler(404, 'Not Found', 'Device not found'),
				...errorHandler(401, 'Unauthorized', 'Invalid credentials'),
				...errorHandler(500, 'Server error', 'Server error'),
			},
		},
	},
	'/api/user/disconnect': {
		get: {
			tags: ['Users'],
			summary: 'Disconnect all devices',
			description: 'Disconnect all devices for the authenticated user',
			security: [{ jwtAuth: [] }],
			responses: {
				200: {
					description: 'All devices disconnected successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									message: {
										type: 'string',
										example:
											'All devices disconnected successfully',
									},
								},
							},
						},
					},
				},
				...errorHandler(401, 'Unauthorized', 'Invalid credentials'),
				...errorHandler(500, 'Server error', 'Server error'),
			},
		},
	},
	'/api/user/search': {
		get: {
			tags: ['Users'],
			summary: 'Search users',
			description:
				'Search for users using a query string and optional page number',
			security: [{ jwtAuth: [] }],
			parameters: [
				{
					in: 'query',
					name: 'query',
					required: true,
					schema: { type: 'string' },
					description: 'Search query',
				},
				{
					in: 'query',
					name: 'page',
					required: false,
					schema: { type: 'number' },
					description: 'Page number for pagination',
				},
			],
			responses: {
				200: {
					description: 'Search results',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									users: {
										type: 'array',
										items: {
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
												picture: {
													type: 'string',
													example:
														'uploads/picture.jpg',
												},
												gender: {
													type: 'string',
													example: 'Male',
												},
												createdAt: {
													type: 'string',
													format: 'date-time',
													example:
														'2021-08-31T12:34:56Z',
												},
												following: {
													type: 'number',
													example: 5,
												},
												followers: {
													type: 'number',
													example: 10,
												},
											},
										},
									},
									count: { type: 'number', example: 50 },
									pages: { type: 'number', example: 5 },
								},
							},
						},
					},
				},
				...errorHandler(
					400,
					'Bad Request',
					'Query parameter is required'
				),
				...errorHandler(401, 'Unauthorized', 'Invalid credentials'),
				...errorHandler(500, 'Server error', 'Server error'),
			},
		},
	},
	'/api/user/google': {
		post: {
			tags: ['Users'],
			summary: 'Google login',
			description: 'Login (or register) a user with a Google account',
			requestBody: {
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								code: {
									type: 'string',
									description: 'Google authorization code',
								},
								device: {
									type: 'object',
									properties: {
										id: {
											type: 'string',
											example: 'device123',
										},
										name: {
											type: 'string',
											example: 'Chrome',
										},
										type: {
											type: 'string',
											example: 'desktop',
										},
									},
									required: ['id', 'name', 'type'],
								},
							},
							required: ['code', 'device'],
						},
					},
				},
			},
			responses: {
				200: {
					description: 'User logged in via Google successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
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
												example: 'uploads/picture.jpg',
											},
										},
									},
									accessToken: {
										type: 'string',
										description:
											'Access token for authentication',
									},
									refreshToken: {
										type: 'string',
										description:
											'Refresh token for obtaining new access tokens',
									},
								},
							},
						},
					},
				},
				...errorHandler(400, 'Invalid token', 'Invalid token'),
				...errorHandler(401, 'Unauthorized', 'Invalid credentials'),
				...errorHandler(500, 'Server error', 'Server error'),
			},
		},
	},
	'/api/user/resend': {
		post: {
			tags: ['Users'],
			summary: 'Resend verification email',
			description: 'Resend the verification email to the user',
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
					description: 'Verification email sent',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									sent: { type: 'boolean', example: true },
								},
							},
						},
					},
				},
				...errorHandler(400, 'Invalid input', 'Invalid email'),
				...errorHandler(500, 'Server error', 'Server error'),
			},
		},
	},
	'/api/user/forgot/email': {
		post: {
			tags: ['Users'],
			summary: 'Send password reset email',
			description: 'Send an email with a password reset link',
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
					description: 'Password reset email sent',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									sent: { type: 'boolean', example: true },
									token: {
										type: 'string',
										description:
											'Reset token (only in test environment)',
										example: 'resetToken123',
									},
								},
							},
						},
					},
				},
				...errorHandler(400, 'Invalid email', 'Invalid email'),
				...errorHandler(404, 'Not Found', 'User not found'),
				...errorHandler(500, 'Server error', 'Server error'),
			},
		},
	},
	'/api/user/forgot/password/{token}/{email}': {
		parameters: [
			{
				in: 'path',
				name: 'token',
				required: true,
				schema: { type: 'string' },
				description: 'Password reset token',
			},
			{
				in: 'path',
				name: 'email',
				required: true,
				schema: { type: 'string', format: 'email' },
				description: 'User email',
			},
		],
		post: {
			tags: ['Users'],
			summary: 'Reset password',
			description:
				'Reset the user password using the provided token and email',
			requestBody: {
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								password: {
									type: 'string',
									format: 'password',
									description: 'New password',
								},
							},
							required: ['password'],
						},
					},
				},
			},
			responses: {
				200: {
					description: 'Password changed successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									message: {
										type: 'string',
										example:
											'Password changed successfully',
									},
								},
							},
						},
					},
				},
				...errorHandler(400, 'Invalid token', 'Invalid token'),
				...errorHandler(500, 'Server error', 'Server error'),
			},
		},
	},
};

export default userPaths;
