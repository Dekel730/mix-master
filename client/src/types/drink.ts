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
