import { useEffect, useState } from 'react';
import CocktailDisplay from './CocktailDisplay';
import { motion } from 'framer-motion';
import Spinner from './Spinner';
import {
	CocktailsData,
	defaultCocktailsData,
	ICocktail,
} from '../types/cocktail';
import Modal from './Modal';
import { authDel } from '../utils/requests';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

interface CocktailListProps {
	cocktails: ICocktail[];
	setCocktails: React.Dispatch<React.SetStateAction<CocktailsData>>;
	fetchMore: (page: number) => Promise<boolean>;
	pages: number;
	query?: string;
}
const CocktailList = ({
	cocktails,
	fetchMore,
	pages,
	setCocktails,
	query,
}: CocktailListProps) => {
	const [page, setPage] = useState<number>(1);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isDeleting, setIsDeleting] = useState<string>('');
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<string>('');
	const { logout } = useAuth();

	const getCocktails = async (page: number) => {
		setIsLoading(true);
		const result = await fetchMore(page);
		if (!result) {
			setPage((prevPage) => prevPage - 1);
		}
		setIsLoading(false);
	};

	const handleDeletePost = async (postId: string) => {
		await authDel(
			`/post/${postId}`,
			(message: string, auth?: boolean) => {
				toast.error(message);
				if (auth) {
					logout();
				}
			},
			() => {
				setCocktails((prev: CocktailsData) => ({
					...prev,
					count: prev.count - 1,
					cocktails: prev.cocktails.filter(
						(cocktail: ICocktail) => cocktail._id !== postId
					),
				}));
			}
		);
	};

	const confirmDelete = async () => {
		setIsDeleting(isDeleteModalOpen);
		const promises = [handleDeletePost(isDeleteModalOpen)];
		setIsDeleteModalOpen('');
		await Promise.all(promises);
		setIsDeleting('');
	};

	useEffect(() => {
		if (page === 1) return;
		if (page <= pages && !isLoading) {
			getCocktails(page);
		}
	}, [page]);

	useEffect(() => {
		if (query === undefined) return;
		setPage(1);
		if (query === '') {
			setCocktails(defaultCocktailsData);
			return;
		}
		if (!isLoading) {
			getCocktails(1);
		}
	}, [query]);

	const handleScroll = () => {
		if (
			window.innerHeight + document.documentElement.scrollTop >=
			document.documentElement.offsetHeight - 100
		) {
			if (isLoading) return;
			setPage((prevPage) => prevPage + 1);
		}
	};

	useEffect(() => {
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const likeUnlike = (cocktail: ICocktail) => {
		setCocktails((prevCocktails: CocktailsData) => ({
			...prevCocktails,
			cocktails: prevCocktails.cocktails.map((prevCocktail: ICocktail) =>
				prevCocktail._id === cocktail._id ? cocktail : prevCocktail
			),
		}));
	};

	return (
		<>
			<motion.div
				initial={{ y: '100vw', opacity: 0 }}
				animate={{ y: -10, opacity: 1 }}
				transition={{
					type: 'spring',
					stiffness: 50,
					damping: 20,
				}}
				className="md:col-span-2"
			>
				{cocktails.length > 0 ? (
					<div className="grid gap-4">
						{cocktails.map((cocktail: ICocktail) => (
							<div key={cocktail._id}>
								<CocktailDisplay
									loader={isDeleting === cocktail._id}
									likeUnlike={likeUnlike}
									cocktail={cocktail}
									handleDeleteUser={setIsDeleteModalOpen}
								/>
							</div>
						))}
					</div>
				) : (
					<div>
						<p className="text-center text-xl text-gray-300 mt-10">
							No cocktails found
						</p>
					</div>
				)}
				{isLoading && (
					<div className="flex justify-center w-full">
						<Spinner width="w-24" height="h-24" />
					</div>
				)}
			</motion.div>
			<Modal
				isOpen={isDeleteModalOpen !== ''}
				onClose={() => setIsDeleteModalOpen('')}
				onConfirm={confirmDelete}
				title="Are you absolutely sure?"
				description="This action cannot be undone. This will permanently delete the cocktail and its comments and remove it from our servers."
				confirmText="Delete Cocktail"
				cancelText="Cancel"
			/>
		</>
	);
};

export default CocktailList;
