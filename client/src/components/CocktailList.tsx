import { useEffect, useState } from 'react';
import CocktailDisplay from './CocktailDisplay';

interface CocktailListProps {
	cocktails: any;
	fetchMore: (page: number) => Promise<void>;
	pages: number;
}
const CocktailList = ({ cocktails, fetchMore, pages }: CocktailListProps) => {
	const [page, setPage] = useState<number>(1);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const getCocktails = async (page: number) => {
		setIsLoading(true);
		await fetchMore(page);
		setIsLoading(false);
	};

	useEffect(() => {
		getCocktails(page);
	}, [page]);

	const handleScroll = () => {
		if (
			window.innerHeight + document.documentElement.scrollTop >=
			document.documentElement.offsetHeight - 100
		) {
			if (page < pages) {
				setPage((prevPage) => prevPage + 1);
			}
		}
	};

	useEffect(() => {
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	return (
		<div className="md:col-span-2">
			{cocktails.map((cocktail: any) => (
				<div key={cocktail._id} className="space-y-4">
					<CocktailDisplay cocktail={cocktail} />
				</div>
			))}
			{isLoading && <p>Loading...</p>}
		</div>
	);
};

export default CocktailList;
