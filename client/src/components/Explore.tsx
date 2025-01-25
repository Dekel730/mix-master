import { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { IDrink } from '../types/drink';
import Input from './inputs/Input';
import RedTitle from './RedTitle';
import { FaSearch } from 'react-icons/fa';
import DrinkDisplay from './DrinkDisplay';
import Spinner from './Spinner';
import RedButton from './RedButton';
import { RiRefreshFill } from 'react-icons/ri';
import { HomeQuery } from '../types/home';

interface ExploreProps {
	drinks: IDrink[];
	refresh: () => Promise<void>;
	query?: string;
	gettingData: boolean;
	register: UseFormRegister<HomeQuery>;
	errors: FieldErrors<HomeQuery>;
	setValue: UseFormSetValue<HomeQuery>;
}
const Explore = ({
	drinks,
	refresh,
	register,
	errors,
	setValue,
	gettingData,
}: ExploreProps) => {
	return (
		<div className="flex flex-col space-y-4">
			<RedTitle title="Explore" />
			<div className="flex w-full items-baseline gap-3">
				<Input<HomeQuery>
					register={register}
					field="searchDrinks"
					placeholder="Search for a cocktail"
					errors={errors}
					containerClassNames="flex-1"
					StartIcon={FaSearch}
					setValue={setValue}
					debounce={true}
				/>
				<RedButton
					handleClick={refresh}
					className="h-11"
					text="Refresh"
					Icon={RiRefreshFill}
					iconClassName="h-4 w-4"
				/>
			</div>
			<RedTitle title="Our Featured Drinks" />
			{drinks.length === 0 ? (
				gettingData ? (
					<div className="w-full flex justify-center">
						<Spinner width="w-32" height="h-32" />
					</div>
				) : (
					<p className="text-white">No cocktails found</p>
				)
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
