import components from './components';
import userPaths from './userPaths';
import commentPaths from './commentPaths';
import cocktailPaths from './cocktailPaths';
import postPaths from './postPaths';


const swaggerSpec = {
	openapi: '3.1.0',
	info: {
		title: 'Mix Master API',
		version: '0.1.0',
		description: 'Mix Master - social network for cocktail enthusiasts',
	},
	servers: [
		{
			url: 'http://node98.cs.colman.ac.il',
		},
	],
	paths: {...userPaths, ...commentPaths, ...cocktailPaths, ...postPaths},
	components
};

export default swaggerSpec;
