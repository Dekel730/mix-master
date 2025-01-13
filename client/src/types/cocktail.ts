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
}

export const cocktailDefault: ICocktail = {
    _id: "",
    title: "",
    description: "",
    ingredients: [],
    instructions: [],
    images: [],
    likes: [],
    likeCount: 0,
    commentCount: 0,
};