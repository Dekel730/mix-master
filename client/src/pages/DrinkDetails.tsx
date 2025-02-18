import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authGet } from '../utils/requests';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { defaultDrink, IDrink } from '../types/drink';
import Loader from '../components/Loader';
import { FaGlassMartiniAlt, FaListUl } from 'react-icons/fa';
import RedTitle from '../components/RedTitle';
import { TbGrillFork } from 'react-icons/tb';
import RedButton from '../components/RedButton';

const DrinkDetails = () => {
	const { id } = useParams();
	const runId = useRef<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [drink, setDrink] = useState<IDrink>(defaultDrink);
	const { logout } = useAuth();
	const navigate = useNavigate();

	const ForkDrink = () => {
		navigate(`/cocktail/new/${id}`);
	};

	const getDrink = async () => {
		setIsLoading(true);
		await authGet(
			`/cocktail/${id}`,
			(message: string, auth?: boolean) => {
				toast.error(message);
				if (auth) {
					logout();
				}
			},
			(data) => {
				setDrink(data.cocktail);
			}
		);
		setIsLoading(false);
	};

	useEffect(() => {
		if (id && id !== runId.current) {
			runId.current = id;
			setDrink(defaultDrink);
			getDrink();
		}
	}, [id]);

	if (isLoading) {
		return <Loader />;
	}

	return (
		<div className="min-h-screen bg-[#1a1a1a] text-white p-4">
			<div className="max-w-4xl mx-auto bg-[#212121] rounded-3xl shadow-xl overflow-hidden">
				<div className="p-8">
					<img
						src={drink.image}
						alt={drink.title}
						className="w-full h-96 object-contain rounded-2xl mb-4"
					/>
					<RedTitle title={drink.description} />
					<h1 className="mt-2 text-3xl leading-8 font-bold">
						{drink.title}
					</h1>

					<div className="mt-8">
						<h2 className="text-2xl font-bold mb-4 flex items-center">
							<FaGlassMartiniAlt className="mr-2" /> Ingredients
						</h2>
						<ul className="list-disc list-inside space-y-2">
							{drink.ingredients.map((ingredient, index) => (
								<li key={index}>
									<span className="font-semibold">
										{ingredient.amount}
									</span>{' '}
									{ingredient.name}
								</li>
							))}
						</ul>
					</div>

					<div className="mt-8">
						<h2 className="text-2xl font-bold mb-4 flex items-center">
							<FaListUl className="mr-2" /> Instructions
						</h2>
						<ol className="list-decimal list-inside space-y-2">
							{drink.instructions.map((instruction, index) => (
								<li key={index} className="mb-2">
									{instruction}
								</li>
							))}
						</ol>
					</div>
				</div>
				<RedButton
					handleClick={ForkDrink}
					text="Fork"
					Icon={TbGrillFork}
					className="h-12 w-full"
					iconClassName="w-4 h-4"
				/>
			</div>
		</div>
	);
};

export default DrinkDetails;
