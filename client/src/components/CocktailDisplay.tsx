import { FaComment, FaEdit, FaEllipsisV, FaTrash } from 'react-icons/fa';
import IconMenu from './IconMenu';
import { Link, useNavigate } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import LikeButton from './LikeButton';
import { authPost } from '../utils/requests';
import { toast } from 'react-toastify';
import { ICocktail } from '../types/cocktail';
import ItemUser from './ItemUser';
import Spinner from './Spinner';
import { useAuth } from '../context/AuthContext';
import GlowingDiv from './GlowingDiv';
import CounterButton from './CounterButton';

interface CocktailDisplayProps {
	cocktail: ICocktail;
	likeUnlike: (cocktail: ICocktail) => void;
	handleDeleteUser: (postId: string) => void;
	loader?: boolean;
}

const CocktailDisplay = ({
	cocktail,
	likeUnlike,
	handleDeleteUser,
	loader,
}: CocktailDisplayProps) => {
	const { logout } = useAuth();
	const user = JSON.parse(localStorage.getItem('user') || '{}');

	const navigate = useNavigate();
	const options = [
		{
			element: (
				<span className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#333333] rounded-b-lg cursor-pointer">
					<FaEdit className="inline-block mr-2" /> Edit
				</span>
			),
			onClick: () => navigate(`/cocktail/${cocktail._id}/edit`),
			id: 'edit',
		},
		{
			element: (
				<span className="block px-4 py-2 text-sm hover:bg-[#333333] rounded-b-lg cursor-pointer text-red-500">
					<FaTrash className="inline-block mr-2" /> Delete
				</span>
			),
			onClick: () => handleDeleteUser(cocktail._id),
			id: 'delete',
		},
	];

	const handlePostLike = async (postId: string) => {
		await authPost(
			`/post/${postId}/like`,
			{},
			(message: string, auth?: boolean) => {
				toast.error(message);
				if (auth) {
					logout();
				}
			}, // אם יש טעות, מציגים הודעה
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
	};

	const goToCocktail = () => {
		navigate(`/cocktail/${cocktail._id}`);
	};

	return (
		<div>
			<GlowingDiv>
				<div
					className={`p-4 flex items-center ${
						loader ? 'hidden' : 'visible'
					}`}
				>
					<ItemUser
						user={cocktail.user}
						createdAt={cocktail.createdAt}
					/>
					{user._id === cocktail.user._id && (
						<IconMenu
							Icon={<FaEllipsisV className="h-4 w-4" />}
							options={options}
							buttonClassName="flex justify-center items-center w-9 h-9"
						/>
					)}
				</div>
				<div
					className={`p-4 space-y-4 ${loader ? 'hidden' : 'visible'}`}
				>
					<Link to={`/cocktail/${cocktail._id}`}>
						<h1 className="text-2xl font-bold text-center p-1">
							{cocktail.title}
						</h1>
					</Link>
					<p className="text-sm text-gray-200">
						{cocktail.description}
					</p>
					{cocktail.images.length > 0 && (
						<Carousel
							showThumbs={false}
							showStatus={false}
							infiniteLoop={true}
							emulateTouch={true}
							swipeable={true}
							dynamicHeight={true}
							onClickItem={goToCocktail}
					>
							{cocktail.images.map(
								(image: string, index: number) => (
									<div key={index}>
										<img
											src={`${
												import.meta.env.VITE_API_ADDRESS
											}/${image}`}
											alt={`${cocktail.title} - Image ${
												index + 1
											}`}
											className="w-full object-contain max-h-[600px]"
										/>
									</div>
								)
							)}
						</Carousel>
					)}

					<div className="flex flex-col md:flex-row items-center gap-4 md:gap-0 md:space-x-4">
						<LikeButton
							itemId={cocktail._id}
							likeAction={handlePostLike}
							likeCount={cocktail.likes.length}
							isLiked={cocktail.likes.includes(user._id)}
						/>
						<CounterButton
							onClick={goToCocktail}
							label="Comments"
							count={cocktail.commentCount}
							Icon={FaComment}
						/>
					</div>
				</div>
				{loader && (
					<div className="flex justify-center items-center w-full">
						<Spinner height="h-32" width="w-32" />
					</div>
				)}
			</GlowingDiv>
		</div>
	);
};

export default CocktailDisplay;
