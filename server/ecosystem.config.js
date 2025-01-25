module.exports = {
	apps: [
		{
			name: 'RESTful API',
			script: './dist/server.js',
			env_production: {
				NODE_ENV: 'production',
			},
		},
	],
};
