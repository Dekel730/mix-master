import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
	definition: {
		openapi: '3.1.0',
		info: {
			title: 'Mix Master API',
			version: '0.1.0',
			description: 'Mix Master - social network for cocktail enthusiasts',
			license: {
				name: 'MIT',
				url: 'https://spdx.org/licenses/MIT.html',
			},
		},
		servers: [
			{
				url: `http://localhost:3000`,
			},
		],
	},
	apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);

export default specs;
