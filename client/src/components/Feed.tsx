import { CocktailsData, ICocktail } from '../types/cocktail'; // שים לב להתאמת סוגי הנתונים
import CocktailList from './CocktailList';
import RedTitle from './RedTitle';

interface FeedProps {
	cocktails: ICocktail[];
	setCocktails: React.Dispatch<React.SetStateAction<CocktailsData>>; // שינוי לשם המידע שלך
	fetchMore: (page: number) => Promise<boolean>;
	pages: number;
}

const Feed = ({ cocktails, fetchMore, pages, setCocktails }: FeedProps) => {
	return (
		<div className='flex flex-col space-y-4'>
            <RedTitle title='Feed' />
			<CocktailList
				cocktails={cocktails}
				setCocktails={setCocktails}
				fetchMore={fetchMore}
				pages={pages}
			/>
		</div>
	);
};

export default Feed;
