import { IDrink } from '../types/drink';
import RedTitle from './RedTitle';
import { useNavigate } from 'react-router-dom';

interface DrinkDisplayProps {
	drink: IDrink;
}

const DrinkDisplay = ({ drink }: DrinkDisplayProps) => {
	const navigate = useNavigate();

	const handleDrinkClick = () => {
		navigate(`/drink/${drink._id}`);
	};

	return (
		<div onClick={handleDrinkClick} className="bg-[#212121] p-4 rounded-lg cursor-pointer">
			<RedTitle className="text-lg text-center" title={drink.title} />
			<p className="text-white text-md py-2">{drink.description}</p>
			<img src={drink.image} alt={drink.title} />
		</div>
	);
};

export default DrinkDisplay;
