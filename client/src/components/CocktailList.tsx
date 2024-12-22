import { useEffect, useState } from 'react';
import CocktailDisplay from './CocktailDisplay';
import { motion } from 'framer-motion';
import Spinner from './Spinner';

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
		if (page === 1) return;
		getCocktails(page);
	}, [page]);

	const handleScroll = () => {
		if (
			window.innerHeight + document.documentElement.scrollTop >=
			document.documentElement.offsetHeight - 100
		) {
			if (isLoading) return;
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
		<motion.div
			initial={{ y: '100vw', opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{
				type: 'spring',
				stiffness: 50,
				damping: 20,
			}}
			className="md:col-span-2"
		>
			{cocktails.map((cocktail: any) => (
				<div key={cocktail._id} className="space-y-4">
					<CocktailDisplay cocktail={cocktail} />
				</div>
			))}
			{isLoading && <Spinner />}
		</motion.div>
	);
};

export default CocktailList;
