import { CocktailsData, ICocktail } from '../types/cocktail';
import { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import Input from './inputs/Input';
import CocktailList from './CocktailList';
import { FaSearch } from 'react-icons/fa';
import RedTitle from './RedTitle';

interface FeedProps {
	cocktails: ICocktail[];
	setCocktails: React.Dispatch<React.SetStateAction<CocktailsData>>;
	fetchMore: (page: number) => Promise<boolean>;
	pages: number;
	query?: string;
	register: UseFormRegister<{ searchQuery: string }>;
	errors: FieldErrors<{ searchQuery: string }>;
	setValue: UseFormSetValue<{ searchQuery: string }>;
}

const Search = ({
	cocktails,
	fetchMore,
	pages,
	setCocktails,
	register,
	errors,
	query,
	setValue,
}: FeedProps) => {
	return (
		<div className="md:col-span-2">
			<RedTitle title='Search' />
			<Input<{ searchQuery: string }>
				register={register}
				field="searchQuery"
				placeholder="Search for a cocktail"
				errors={errors}
				StartIcon={FaSearch}
				setValue={setValue}
				debounce={true}
			/>
			<div className="mt-4">
				<CocktailList
					cocktails={cocktails}
					fetchMore={fetchMore}
					pages={pages}
					setCocktails={setCocktails}
					query={query}
				/>
			</div>
		</div>
	);
};

export default Search;
