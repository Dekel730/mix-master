import { Fragment, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import Loader from '../components/Loader';
import { authGet, getAccessToken } from '../utils/requests';
import { toast } from 'react-toastify';
import { getUserPicture } from '../utils/functions';
import { IUserProfile, userProfileDefault } from '../types/user';
import { FaUserMinus, FaUserPlus } from 'react-icons/fa';
import CocktailList from '../components/CocktailList';
import Spinner from '../components/Spinner';
import { motion } from 'framer-motion';
import { deleteAuthLocalStorage } from '../utils/functions';

const UserProfile = () => {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [following, setFollowing] = useState<boolean>(false);
	const [user, setUser] = useState<IUserProfile>(userProfileDefault);
	const [CocktailsData, setCocktailsData] = useState<any>({
		cocktails: [],
		count: 2,
		pages: 30,
	});

	const userId = useRef<string>('');

	const { id } = useParams<{ id: string }>();

	const getUser = async () => {
		await authGet(
			`/user/${id}`,
			(message: string) => {
				toast.error(message);
			},
			(data: any) => {
				setUser({
					...data.user,
					createdAt: new Date(data.user.createdAt),
				});
			}
		);
	};

	const getCocktails = async (
		page?: number,
		loading?: boolean
	): Promise<boolean> => {
		page = page || 1;
		if (loading) {
			setIsLoading(true);
		}
		let result = false;
		await authGet(
			`/post/user/${id}?page=${page}`,
			(message: string) => {
				toast.error(message);
				return false;
			},
			(data: any) => {
				setCocktailsData((prev: any) => ({
					cocktails: [...prev.cocktails, ...data.posts],
					count: data.count,
					pages: data.pages,
				}));
				result = true;
			}
		);
		if (loading) {
			setIsLoading(false);
		}
		return result;
	};

	const followUser = async () => {
		setFollowing(true);
		await authGet(
			`/user/follow/${id}`,
			(message: string) => {
				toast.error(message);
			},
			() => {
				setUser((prev) => ({
					...prev,
					followers: prev.followers + 1,
					isFollowing: true,
				}));
			}
		);
		setFollowing(false);
	};

	const unFollowUser = async () => {
		setFollowing(true);
		await authGet(
			`/user/unfollow/${id}`,
			(message: string) => {
				toast.error(message);
			},
			() => {
				setUser((prev) => ({
					...prev,
					followers: prev.followers - 1,
					isFollowing: false,
				}));
			}
		);
		setFollowing(false);
	};

	const getData = async () => {
		setIsLoading(true);
		const accessToken = await getAccessToken();
		if (!accessToken) {
			toast.error('Please login to continue');
			deleteAuthLocalStorage();
			return;
		}
		const promises = [getUser(), getCocktails()];
		await Promise.all(promises);
		setIsLoading(false);
	};

	useEffect(() => {
		if (id !== userId.current) {
			userId.current = id!;
			setCocktailsData({
				cocktails: [],
				count: 2,
				pages: 30,
			});
			getData();
		}
	}, [id]);

	if (isLoading) {
		return <Loader />;
	}

	return (
		<main>
			<div className="min-h-screen bg-zinc-900 text-white p-4">
				<div className="max-w-6xl mx-auto">
					<div className="bg-zinc-800 rounded-lg border border-zinc-700 p-6">
						<div className="flex gap-4 flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-zinc-700">
							<div className="flex items-center space-x-4">
								<h1 className="text-2xl font-bold">
									{user.f_name} {user.l_name}
								</h1>
							</div>
						</div>

						<div className="py-6">
							<div className="grid md:grid-cols-3 gap-8">
								{/* Profile Info */}
								<div className="md:col-span-1">
									<motion.img
										src={getUserPicture(user)}
										animate={{ scale: [0, 1] }}
										transition={{ delay: 0.5 }}
										alt="Profile picture"
										className="rounded-full w-80 h-80 object-cover mb-6 mx-auto"
									/>
									<div className="grid grid-cols-3 gap-4 text-center mb-4">
										<div>
											<div className="text-2xl font-bold">
												{CocktailsData.count}
											</div>
											<div className="text-sm text-zinc-400">
												Cocktails
											</div>
										</div>
										<div>
											<div className="text-2xl font-bold">
												{user.followers}
											</div>
											<div className="text-sm text-zinc-400">
												Followers
											</div>
										</div>
										<div>
											<div className="text-2xl font-bold">
												{user.following}
											</div>
											<div className="text-sm text-zinc-400">
												Following
											</div>
										</div>
									</div>
									{!user.self && (
										<button
											disabled={following}
											onClick={
												user.isFollowing
													? unFollowUser
													: followUser
											}
											className="flex w-full disabled:bg-[#a9251c]
                      items-center justify-center space-x-2 bg-[#D93025] hover:bg-[#B71C1C] 
                      text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out mb-4"
										>
											{following && <Spinner />}
											{!following &&
												(user.isFollowing ? (
													<Fragment>
														<FaUserMinus className="h-4 w-4" />
														<span>unFollow</span>
													</Fragment>
												) : (
													<Fragment>
														<FaUserPlus className="h-4 w-4" />
														<span>Follow</span>
													</Fragment>
												))}
										</button>
									)}
									<p className="text-zinc-300 mb-4">
										{user.bio}
									</p>
								</div>
								<CocktailList
									setCocktails={setCocktailsData}
									cocktails={CocktailsData.cocktails}
									fetchMore={getCocktails}
									pages={CocktailsData.pages}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
};

export default UserProfile;
