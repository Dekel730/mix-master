import components from './components';
import userPaths from './userPaths';

const swaggerSpec = {
	openapi: '3.1.0',
	info: {
		title: 'Mix Master API',
		version: '0.1.0',
		description: 'Mix Master - social network for cocktail enthusiasts',
	},
	servers: [
		{
			url: 'http://localhost:3000',
		},
	],
	paths: {...userPaths},
	components
};

export default swaggerSpec;
