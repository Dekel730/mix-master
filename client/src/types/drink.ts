export interface IDrink {
	_id: string;
	title: string;
	image: string;
	instructions: string[];
	ingredients: {
		name: string;
		amount: string;
	}[];
	description: string;
}

export const defaultDrink: IDrink = {
	_id: '',
	title: '',
	image: '',
	instructions: [],
	ingredients: [],
	description: '',
};
