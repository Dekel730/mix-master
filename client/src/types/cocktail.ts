import { UserPost } from './user';

export interface ICocktail {
	_id: string;
	title: string;
	description: string;
	ingredients: { amount: string; name: string }[];
	instructions: string[];
	images: string[];
	likes: string[];
	likeCount: number;
	commentCount: number;
	createdAt: string;
	user: UserPost;
	ai?: boolean;
}

export interface CocktailsData {
	cocktails: ICocktail[];
	count: number;
	pages: number;
}

export const defaultCocktailsData: CocktailsData = {
	cocktails: [],
	count: 0,
	pages: 0,
};

export const cocktailDefault: ICocktail = {
	_id: '',
	title: '',
	description: '',
	ingredients: [],
	instructions: [],
	images: [],
	likes: [],
	likeCount: 0,
	commentCount: 0,
	user: {
		_id: '',
		f_name: '',
		l_name: '',
		gender: 'Other',
		picture: '',
	},
	createdAt: new Date().toISOString(),
};
