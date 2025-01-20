import { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { IDrink } from '../types/drink';
import Input from './inputs/Input';
import RedTitle from './RedTitle';
import { FaSearch } from 'react-icons/fa';
import DrinkDisplay from './DrinkDisplay';

interface ExploreProps {
	drinks: IDrink[];
	refresh: () => Promise<void>;
	query?: string;
	register: UseFormRegister<{ searchQuery: string; searchDrinks: string }>;
	errors: FieldErrors<{ searchQuery: string; searchDrinks: string }>;
	setValue: UseFormSetValue<{ searchQuery: string; searchDrinks: string }>;
}
const Explore = ({
	drinks,
	refresh,
	register,
	errors,
	setValue,
}: ExploreProps) => {
	return (
		<div className="flex flex-col space-y-4">
			<RedTitle title="Explore" />
			<div className="flex w-full items-baseline gap-3">
				<Input<{ searchQuery: string; searchDrinks: string }>
					register={register}
					field="searchDrinks"
					placeholder="Search for a cocktail"
					errors={errors}
					containerClassNames="flex-1"
					StartIcon={FaSearch}
					setValue={setValue}
					debounce={true}
				/>
				<button
					onClick={refresh}
					className="bg-[#D93025] hover:bg-[#C12717] text-white h-11 rounded-xl font-medium transition-colors hover:border-gray-500"
				>
					Refresh cocktails
				</button>
			</div>
			<RedTitle title="Our Featured Cocktails" />
			{drinks.length === 0 ? (
				<p className="text-white">No cocktails found</p>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{drinks.map((drink) => (
						<DrinkDisplay key={drink._id} drink={drink} />
					))}
				</div>
			)}
		</div>
	);
};

export default Explore;
