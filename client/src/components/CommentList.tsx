import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Spinner from './Spinner';
import { IComment } from '../types/comment';
import CommentItem from './CommentItem';
import CreateComment from './CreateComment';
import LikeButton from './LikeButton';
import { UserPost } from '../types/user';
import {
	FieldErrors,
	FieldValues,
	UseFormHandleSubmit,
	UseFormRegister,
} from 'react-hook-form';
import ItemUser from './ItemUser';
import IconMenu from './IconMenu';
import { FaEllipsisV, FaTrash } from 'react-icons/fa';
import { authDel } from '../utils/requests';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

interface CommentListProps {
	comments: IComment[];
	fetchMore: (page: number) => Promise<boolean>;
	pages: number;
	replyingTo: string;
	setReplyingTo: React.Dispatch<React.SetStateAction<string>>;
	handleCommentLike: (commentId: string) => Promise<void>;
	handleSubmitReply: UseFormHandleSubmit<FieldValues>;
	handleReplySubmit: (data: FieldValues) => void;
	loadingComment: string;
	registerReply: UseFormRegister<FieldValues>;
	errorsReply: FieldErrors<FieldValues>;
	handleReplyLike: (replyId: string) => Promise<void>;
	getReplies: (commentId: string, page: number) => Promise<void>;
	deleteComment: (commentId: string) => void;
	deleteReply: (replyId: string, commentId: string) => void;
}

const CommentList = ({
	comments,
	fetchMore,
	pages,
	replyingTo,
	setReplyingTo,
	handleCommentLike,
	handleSubmitReply,
	handleReplySubmit,
	loadingComment,
	registerReply,
	errorsReply,
	handleReplyLike,
	getReplies,
	deleteComment,
	deleteReply,
}: CommentListProps) => {
	const [page, setPage] = useState<number>(1);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [commentLoading, setCommentLoading] = useState<string>('');
	const [replyLoading, setReplyLoading] = useState<string>('');
	const user: UserPost = JSON.parse(localStorage.getItem('user') || '{}');
	const { logout } = useAuth();

	const getComments = async (page: number) => {
		setIsLoading(true);
		const result = await fetchMore(page);
		if (!result) {
			setPage((prevPage) => prevPage - 1);
		}
		setIsLoading(false);
	};

	const getMoreReplies = async (comment: IComment) => {
		setCommentLoading(comment._id);
		const page = Math.ceil(comment.replies.length / 3) + 1;
		await getReplies(comment._id, page);
		setCommentLoading('');
	};

	const deleteReplyRequest = async (replyId: string, commentId: string) => {
		setReplyLoading(replyId);
		await authDel(
			`/comment/${replyId}`,
			(message: string, auth?: boolean) => {
				toast.error(message);
				if (auth) {
					logout();
				}
			},
			() => {
				toast.success('Reply deleted successfully');
				deleteReply(replyId, commentId);
			}
		);
		setReplyLoading('');
	};

	useEffect(() => {
		if (page === 1) return;
		if (page <= pages && !isLoading) {
			getComments(page);
		}
	}, [page]);

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
			className="ml-8"
		>
			{comments.map((comment) => (
				<div
					key={comment._id}
					className="mb-6 border-b border-gray-600 pb-6"
				>
					<CommentItem
						deleteComment={deleteComment}
						comment={comment}
						openReply={replyingTo}
						reply={setReplyingTo}
						user={user}
						commentLike={handleCommentLike}
					/>
					{replyingTo === comment._id && (
						<form
							className="mt-4"
							onSubmit={handleSubmitReply(handleReplySubmit)}
						>
							<CreateComment
								user={user}
								id={comment._id}
								loadingComment={loadingComment}
								field="content"
								placeholder="Write a reply..."
								register={registerReply}
								errors={errorsReply}
							/>
						</form>
					)}
					{comment.replies.length > 0 && (
						<div className="mt-4">
							{comment.replies.map((reply: IComment) => {
								const options = [
									{
										element: (
											<span className="block px-4 py-2 text-sm hover:bg-[#333333] rounded-b-lg cursor-pointer text-red-500">
												<FaTrash className="inline-block mr-2" />{' '}
												Delete
											</span>
										),
										onClick: () =>
											deleteReplyRequest(
												reply._id,
												comment._id
											),
										id: 'delete',
									},
								];
								if (replyLoading === reply._id) {
									return (
										<div
											key={reply._id}
											className="ml-8 mb-4 p-4 bg-[#2a2a2a] rounded-xl shadow-md w-full flex justify-center items-center"
										>
											<Spinner
												width="w-16"
												height="h-16"
											/>
										</div>
									);
								}
								return (
									<div
										key={reply._id}
										className="ml-8 mb-4 flex-col items-center p-4 bg-[#2a2a2a] rounded-xl shadow-md"
									>
										<div className="p-4 flex items-center justify-between">
											<ItemUser
												user={reply.user}
												createdAt={reply.createdAt}
											/>
											{reply.user._id === user._id && (
												<IconMenu
													Icon={
														<FaEllipsisV className="h-4 w-4" />
													}
													options={options}
													buttonClassName="flex justify-center items-center w-9 h-9"
												/>
											)}
										</div>
										<p className="text-gray-400 ml-8 mt-2">
											{reply.content}
										</p>
										<div className="mt-2">
											<LikeButton
												itemId={reply._id}
												likeAction={handleReplyLike}
												likeCount={reply.likes.length}
												isLiked={reply.likes.includes(
													user._id
												)}
											/>
										</div>
									</div>
								);
							})}
							{comment.repliesCount > comment.replies.length && (
								<button
									disabled={commentLoading === comment._id}
									className="ml-8 mt-2 text-[#D93025]"
									onClick={() => getMoreReplies(comment)}
								>
									{commentLoading === comment._id ? (
										<Spinner />
									) : (
										'View more replies'
									)}
								</button>
							)}
						</div>
					)}
				</div>
			))}
			{isLoading && <Spinner />}
		</motion.div>
	);
};

export default CommentList;
