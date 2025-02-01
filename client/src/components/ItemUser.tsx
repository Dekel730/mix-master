import TimeAgo from 'javascript-time-ago';
import { UserPost } from '../types/user';
import { getUserPicture } from '../utils/functions';
import { Link, useNavigate } from 'react-router-dom';

interface ItemUserProps {
	user: UserPost;
	createdAt: string;
	joined?: boolean;
}
const ItemUser = ({ user, createdAt, joined }: ItemUserProps) => {
	const navigate = useNavigate();
	const timeAgo = new TimeAgo('en-US');
	const gotoUserProfile = (
		e: React.MouseEvent<HTMLDivElement | HTMLParagraphElement, MouseEvent>
	) => {
		e.stopPropagation();
		navigate(`/user/${user._id}`);
	};
	return (
		<>
			<div
				onClick={gotoUserProfile}
				className="h-8 w-8 rounded-full overflow-hidden cursor-pointer"
			>
				<img
					src={getUserPicture(user)}
					alt="Avatar"
					className="h-full w-full object-cover"
				/>
			</div>
			<div className="ml-3 flex-1">
				<Link to={`/user/${user._id}`}>
					<p className="text-sm font-medium hover:text-[#D93025] hover:underline inline">
						{user.f_name} {user.l_name}
					</p>
				</Link>
				<p className="text-xs text-zinc-400">
					{joined && 'Joined Mix Master: '}
					{timeAgo.format(new Date(createdAt))}
				</p>
			</div>
		</>
	);
};

export default ItemUser;
