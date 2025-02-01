import { motion } from 'framer-motion';
import { IUserSearch, UsersData, usersDataDefault } from '../types/user';
import Spinner from './Spinner';
import { useEffect, useState } from 'react';
import ItemUser from './ItemUser';
import GlowingDiv from './GlowingDiv';

interface UserListProps {
	users: IUserSearch[];
	setUsers: React.Dispatch<React.SetStateAction<UsersData>>;
	fetchMore: (page: number) => Promise<boolean>;
	pages: number;
	query?: string;
}
const UserList = ({
	users,
	setUsers,
	fetchMore,
	pages,
	query,
}: UserListProps) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [page, setPage] = useState<number>(1);

	const getUsers = async (page: number) => {
		setIsLoading(true);
		const result = await fetchMore(page);
		if (!result) {
			setPage((prevPage) => prevPage - 1);
		}
		setIsLoading(false);
	};

	useEffect(() => {
		if (page === 1) return;
		if (page <= pages && !isLoading) {
			console.log('fetching more');
			getUsers(page);
		}
	}, [page]);

	useEffect(() => {
		if (query === undefined) return;
		setPage(1);
		if (query === '') {
			setUsers(usersDataDefault);
			return;
		}
		if (!isLoading) {
			console.log('fetching');
			getUsers(1);
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

	return (
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
			{users.length > 0 ? (
				<div className="grid gap-4">
					{users.map((user: IUserSearch) => (
						<GlowingDiv key={user._id}>
							<div className="bg-[#212121] rounded-lg p-4">
								<div className="flex items-start gap-3">
									<div className="flex-grow">
										<div className="flex items-center gap-2">
											<ItemUser
												user={user}
												createdAt={user.createdAt}
												joined={true}
											/>
										</div>
										{user.bio && (
											<p className="text-gray-300 mt-2 text-sm">
												{user.bio}
											</p>
										)}
										<div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-400">
											<span>
												{user.following} Following
											</span>
											<span>
												{user.followers} Followers
											</span>
										</div>
									</div>
								</div>
							</div>
						</GlowingDiv>
					))}
				</div>
			) : (
				<div>
					<p className="text-center text-xl text-gray-300 mt-10">
						No users found
					</p>
				</div>
			)}
			{isLoading && (
				<div className="flex justify-center w-full">
					<Spinner width="w-24" height="h-24" />
				</div>
			)}
		</motion.div>
	);
};

export default UserList;
