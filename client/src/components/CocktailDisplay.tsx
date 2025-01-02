import {
	FaComment,
	FaEdit,
	FaEllipsisV,
	FaHeart,
	FaTrash,
} from 'react-icons/fa';
import { getUserPicture } from '../utils/functions';
import IconMenu from './IconMenu';
import TimeAgo from 'javascript-time-ago';
import { useState } from 'react';
import Spinner from './Spinner';
import { authPost } from '../utils/requests';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';

interface CocktailDisplayProps {
	cocktail: any;
	likeUnlike: (cocktail: any) => void;
}

const CocktailDisplay = ({ cocktail, likeUnlike }: CocktailDisplayProps) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const user = JSON.parse(localStorage.getItem('user') || '{}');
	const timeAgo = new TimeAgo('en-US');

	const navigate = useNavigate();
	const options = [
		{
			// edit option
			element: (
				<span className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#333333] rounded-b-lg cursor-pointer">
					<FaEdit className="inline-block mr-2" /> Edit
				</span>
			),
			onClick: () => console.log('Edit'),
			id: 'edit',
		},
		{
			// delete option
			element: (
				<span className="block px-4 py-2 text-sm hover:bg-[#333333] rounded-b-lg cursor-pointer text-red-500">
					<FaTrash className="inline-block mr-2" /> Delete
				</span>
			),
			onClick: () => console.log('Delete'),
			id: 'delete',
		},
	];

	const goToCocktail = () => {
		navigate(`/cocktail/${cocktail._id}`);
	};

	const gotoUserProfile = (
		e: React.MouseEvent<HTMLDivElement | HTMLParagraphElement, MouseEvent>
	) => {
		e.stopPropagation();
		navigate(`/user/${cocktail.user._id}`);
	};

	const likeUnlikePost = async (
		e: React.MouseEvent<HTMLButtonElement, MouseEvent>
	) => {
		e.stopPropagation();
		setIsLoading(true);
		await authPost(
			`/post/${cocktail._id}/like`,
			{},
			(message) => {
				toast.error(message);
			},
			() => {
				likeUnlike({
					...cocktail,
					likes: cocktail.likes.includes(user._id)
						? cocktail.likes.filter((id: string) => id !== user._id)
						: [...cocktail.likes, user._id],
					likeCount: cocktail.likes.includes(user._id)
						? cocktail.likeCount - 1
						: cocktail.likeCount + 1,
				});
			}
		);
		setIsLoading(false);
	};
	return (
		<div className="bg-zinc-800 rounded-lg border border-zinc-700">
			<div className="p-4 flex items-center">
				<div
					onClick={gotoUserProfile}
					className="h-8 w-8 rounded-full overflow-hidden cursor-pointer"
				>
					<img
						src={getUserPicture(cocktail.user)}
						alt="Avatar"
						className="h-full w-full object-cover"
					/>
				</div>
				<div className="ml-3 flex-1">
					<Link to={`/user/${cocktail.user._id}`}>
						<p className="text-sm font-medium hover:text-[#D93025] hover:underline">
							{cocktail.user.f_name} {cocktail.user.l_name}
						</p>
					</Link>
					<p className="text-xs text-zinc-400">
						{timeAgo.format(new Date(cocktail.createdAt))}
					</p>
				</div>
				{user._id === cocktail.user._id && (
					<IconMenu
						Icon={<FaEllipsisV className="h-4 w-4" />}
						options={options}
						buttonClassName="flex justify-center items-center w-9 h-9"
					/>
				)}
			</div>
			<div
				onClick={goToCocktail}
				className="p-4 space-y-4 cursor-pointer"
			>
				{cocktail.picture && (
					<img
						src={`${import.meta.env.VITE_API_ADDRESS}/${
							cocktail.picture
						}`}
						alt="Cocktail cocktail"
						className="rounded-lg w-full object-cover"
					/>
				)}
				<p className="text-sm text-zinc-300">{cocktail.description}</p>
				<div className="flex items-center space-x-4">
					<button
						onClick={likeUnlikePost}
						disabled={isLoading}
						className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-[#D93025]/10"
					>
						<FaHeart
							className={`h-4 w-4 ${
								cocktail.likes.includes(user._id)
									? 'text-[#D93025]'
									: ''
							}`}
						/>
						<span
							className={
								cocktail.likes.includes(user._id)
									? 'text-[#D93025]'
									: ''
							}
						>
							{isLoading ? <Spinner /> : cocktail.likeCount}
						</span>
					</button>
					<button
						onClick={goToCocktail}
						className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-zinc-700"
					>
						<FaComment className="h-4 w-4" />
						<span>{cocktail.commentCount}</span>
					</button>
				</div>
			</div>
		</div>
	);
};

export default CocktailDisplay;
