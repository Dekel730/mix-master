import { FaCocktail, FaUser, FaSearch } from 'react-icons/fa';
import { useEffect, useRef, useState } from 'react';
import { authGet } from '../utils/requests';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';

import { CocktailsData, defaultCocktailsData } from '../types/cocktail';
import Feed from '../components/Feed';
import Explore from '../components/Explore';
import Search from '../components/Search';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

const Home = () => {
	const tabs = [
		{
			id: 'feed',
			label: 'Feed',
			icon: FaUser,
			component: Feed,
		},
		{
			id: 'explore',
			label: 'Explore',
			icon: FaCocktail,
			component: Explore,
		},
		{
			id: 'search',
			label: 'Search',
			icon: FaSearch,
			component: Search,
		},
	];

	const [activeTab, setActiveTab] = useState(tabs[0].id);
	const [gettingData, setGettingData] = useState(false);
	const {
		watch,
		register,
		setValue,
		formState: { errors },
	} = useForm<{
		searchQuery: string;
	}>();
	const hasRun = useRef(false);
	const hasChanged = useRef(false);

	const searchQuery = watch('searchQuery');

	const TabContent =
		tabs.find((tab) => tab.id === activeTab)?.component || Feed;

	const [CocktailsData, setCocktailsData] =
		useState<CocktailsData>(defaultCocktailsData);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const navigate = useNavigate();

	const handleClick = () => {
		navigate('/cocktail/new'); 
	};

	const getSearchResults = async (page?: number, loading?: boolean) => {
		setGettingData(true);
		page = page || 1;
		if (loading) {
			setIsLoading(true);
		}
		let result = false;

		await authGet(
			`/post/search/?page=${page}&query=${searchQuery}`,
			(message: string) => {
				toast.error(message);
			},
			(data: CocktailsData) => {
				if (page === 1) {
					setCocktailsData({
						cocktails: data.cocktails,
						count: data.count,
						pages: data.pages,
					});
				} else {
					setCocktailsData((prev: CocktailsData) => ({
						cocktails: [...prev.cocktails, ...data.cocktails],
						count: data.count,
						pages: data.pages,
					}));
				}
				result = true;
			}
		);

		if (loading) {
			setIsLoading(false);
		}
		setGettingData(false);
		return result;
	};

	const getFeedPosts = async (
		page?: number,
		loading?: boolean
	): Promise<boolean> => {
		setGettingData(true);
		page = page || 1;
		if (loading) {
			setIsLoading(true);
		}
		let result = false;

		await authGet(
			`/post/?page=${page}`,
			(message: string) => {
				toast.error(message);
			},
			(data: CocktailsData) => {
				setCocktailsData((prev: CocktailsData) => ({
					cocktails: [...prev.cocktails, ...data.cocktails],
					count: data.count,
					pages: data.pages,
				}));
				result = true;
			}
		);

		if (loading) {
			setIsLoading(false);
		}
		setGettingData(false);
		return result;
	};

	useEffect(() => {
		if (activeTab !== 'search') {
			setValue('searchQuery', '');
		}
		if (activeTab !== 'feed') {
			hasChanged.current = true;
		}
		if (activeTab === 'feed') {
			if (!hasRun.current) {
				hasRun.current = true;
				getFeedPosts(1, true);
			}
			if (hasChanged.current) {
				setCocktailsData(defaultCocktailsData);
				getFeedPosts(1, false);
			}
		}
		if (activeTab === 'search') {
			setCocktailsData(defaultCocktailsData);
		}
	}, [activeTab]);

	if (isLoading) {
		return <Loader />;
	}

	return (
		<main className=" bg-[#1a1a1a] text-white">
			<div className="w-full flex-1 p-4 text-center">
				<h1 className="text-2xl font-bold mb-6">Home</h1>
				<div className="flex flex-col md:flex-row gap-4 text-start min-h-[calc(100vh-200px)]">
					{/* Sidebar container */}
					<div className="md:w-64 bg-[#2a2a2a] rounded-lg flex flex-col h-fit">
						{/* Sidebar for desktop */}
						<div className="hidden md:flex flex-col space-y-2 p-4 flex-grow">
							{tabs.map((tab) => (
								<button
									disabled={gettingData}
									key={tab.id}
									className={`flex items-center p-3 rounded-lg transition-colors disabled:cursor-not-allowed disabled:bg-gray-500 ${
										activeTab === tab.id
											? 'bg-[#D93025] text-white'
											: 'hover:bg-[#696969]'
									}`}
									onClick={() => setActiveTab(tab.id)}
								>
									<tab.icon className="mr-3" />
									{tab.label}
								</button>
							))}
						</div>
						{/* Add Cocktail button */}
						<button
							className="mt-3 md:mt-16 mb-1 md:mb-4 p-3 mx-4 w-auto bg-[#D93025] rounded-lg text-white flex-col hover:bg-[#D93025]/90 flex items-center"
							onClick={handleClick}
						>
							Add New Cocktail
						</button>

						{/* Tabs for mobile */}
						<div className="flex md:hidden scrollbar-hide overflow-x-auto space-x-2 p-4">
							{tabs.map((tab) => (
								<button
									key={tab.id}
									className={`flex items-center p-2 rounded-lg transition-colors whitespace-nowrap flex-1 ${
										activeTab === tab.id
											? 'bg-[#D93025] text-white'
											: 'bg-[#2a2a2a]'
									}`}
									onClick={() => setActiveTab(tab.id)}
								>
									<tab.icon className="mr-2" />
									{tab.label}
								</button>
							))}
						</div>
					</div>

					{/* Content container */}
					<div className="flex-1 bg-[#2a2a2a] p-4 rounded-lg h-fit scrollbar-hide">
						<TabContent
							setCocktails={setCocktailsData}
							cocktails={CocktailsData.cocktails}
							fetchMore={
								activeTab === 'search'
									? getSearchResults
									: getFeedPosts
							}
							pages={CocktailsData.pages}
							register={register}
							errors={errors}
							setValue={setValue}
							query={searchQuery}
						/>
					</div>
				</div>
			</div>
		</main>
	);
};

export default Home;
