const components = {
	schemas: {
		User: {
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
				isVerified: {
					type: 'boolean',
					description: 'Whether the user is verified',
				},
				resetPasswordToken: {
					type: 'string',
					description: 'Token used for resetting the password',
				},
				picture: {
					type: 'string',
					format: 'url',
					description: 'Profile picture URL',
				},
				followers: {
					type: 'array',
					items: {
						type: 'string',
						format: 'uuid',
						description: 'IDs of users who follow this user',
					},
					description: 'Array of follower IDs',
				},
				following: {
					type: 'array',
					items: {
						type: 'string',
						format: 'uuid',
						description: 'IDs of users this user follows',
					},
					description: 'Array of following IDs',
				},
				createdAt: {
					type: 'string',
					format: 'date-time',
					description: 'Timestamp when the user was created',
				},
			},
			required: [
				'f_name',
				'l_name',
				'email',
				'password',
				'isVerified',
				'followers',
				'following',
			],
			description: 'Schema representing a user in the system',
		},
	},
};

export default components;
