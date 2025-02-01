import React, { useState } from 'react';
import { IComment } from '../types/comment';
import LikeButton from './LikeButton';
import { UserPost } from '../types/user';
import ItemUser from './ItemUser';
import IconMenu from './IconMenu';
import { FaComment, FaEllipsisV, FaTrash } from 'react-icons/fa';
import Spinner from './Spinner';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { authDel } from '../utils/requests';
import CounterButton from './CounterButton';

interface CommentItemProps {
	comment: IComment;
	reply: (commentId: string) => void;
	commentLike: (commentId: string) => Promise<void>;
	openReply: string;
	user: UserPost;
	deleteComment: (commentId: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
	comment,
	reply,
	openReply,
	user,
	commentLike,
	deleteComment,
}) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const { logout } = useAuth();
	const handleReply = (commentId: string) => {
		if (openReply === commentId) {
			reply('');
			return;
		}
		reply(commentId);
	};

	const deleteCommentRequest = async () => {
		setIsLoading(true);
		await authDel(
			`/comment/${comment._id}`,
			(message: string, auth?: boolean) => {
				toast.error(message);
				if (auth) {
					logout();
				}
			},
			() => {
				toast.success('Comment deleted successfully');
				deleteComment(comment._id);
			}
		);
		setIsLoading(false);
	};

	const options = [
		{
			element: (
				<span className="block px-4 py-2 text-sm hover:bg-[#333333] rounded-b-lg cursor-pointer text-red-500">
					<FaTrash className="inline-block mr-2" /> Delete
				</span>
			),
			onClick: () => deleteCommentRequest(),
			id: 'delete',
		},
	];

	if (isLoading) {
		return (
			<div className="w-full p-4 bg-[#2a2a2a] rounded-xl shadow-md flex justify-center items-center">
				<Spinner width="w-16" height="h-16" />
			</div>
		);
	}

	return (
		<div className="p-4 bg-[#2a2a2a] rounded-xl shadow-md">
			<div className="p-4 flex items-center justify-between">
				<ItemUser user={comment.user} createdAt={comment.createdAt} />
				{user._id === comment.user._id && (
					<IconMenu
						Icon={<FaEllipsisV className="h-4 w-4" />}
						options={options}
						buttonClassName="flex justify-center items-center w-9 h-9"
					/>
				)}
			</div>
			<p className="text-gray-400 mb-4 ml-8">{comment.content}</p>
			<div className="flex flex-col md:flex-row items-center gap-4 md:gap-0 md:space-x-4">
				<LikeButton
					itemId={comment._id}
					likeAction={commentLike}
					likeCount={comment.likes.length}
					isLiked={comment.likes.includes(user._id)}
				/>
				<CounterButton
					onClick={() => handleReply(comment._id)}
					label="Reply"
					count={comment.replies.length}
					Icon={FaComment}
				/>
			</div>
		</div>
	);
};

export default CommentItem;
