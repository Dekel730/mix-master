import { CocktailsData, ICocktail } from '../types/cocktail';
import { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import Input from './inputs/Input';
import CocktailList from './CocktailList';
import { FaSearch } from 'react-icons/fa';
import RedTitle from './RedTitle';
import { HomeQuery } from '../types/home';

interface SearchProps {
	cocktails: ICocktail[];
	setCocktails: React.Dispatch<React.SetStateAction<CocktailsData>>;
	fetchMore: (page: number) => Promise<boolean>;
	pages: number;
	query?: string;
	register: UseFormRegister<HomeQuery>;
	errors: FieldErrors<HomeQuery>;
	setValue: UseFormSetValue<HomeQuery>;
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
}: SearchProps) => {
	return (
		<div className="md:col-span-2">
			<RedTitle title="Search Cocktails" />
			<Input<HomeQuery>
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
