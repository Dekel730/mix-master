import React, { useState, useEffect, useRef } from 'react';
import {
	FaGlassMartiniAlt,
	FaListUl,
	FaComment,
	FaEllipsisV,
	FaEdit,
	FaTrash,
} from 'react-icons/fa';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import Loader from '../components/Loader';
import { authDel, authGet, authPost, getAccessToken } from '../utils/requests';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import LikeButton from '../components/LikeButton';
import { ICocktail, cocktailDefault } from '../types/cocktail';
import { CommentData, defaultCommentData } from '../types/comment';
import CreateComment from '../components/CreateComment';
import { FieldValues, useForm } from 'react-hook-form';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import CommentList from '../components/CommentList';
import ItemUser from '../components/ItemUser';
import RedTitle from '../components/RedTitle';
import IconMenu from '../components/IconMenu';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import ShiningText from '../components/ShiningText';
import CounterButton from '../components/CounterButton';
import ImagePreview from '../components/ImagePreview';

const CocktailDisplay: React.FC = () => {
	const [cocktail, setCocktail] = useState<ICocktail>(cocktailDefault);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const postId = useRef<string>('');
	const [loadingComment, setLoadingComment] = useState<string>('');
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<string>('');
	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const navigate = useNavigate();

	const [commentsData, setCommentsData] =
		useState<CommentData>(defaultCommentData);
	const [replyingTo, setReplyingTo] = useState<string>('');
	const user = JSON.parse(localStorage.getItem('user') || '{}');

	const { id } = useParams<{ id: string }>();

	const { logout } = useAuth();

	const commentSchema = z.object({
		content: z.string().min(1, 'Comment must be at least 1 character.'),
	});

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm({ resolver: zodResolver(commentSchema) });

	const replySchema = z.object({
		content: z.string().min(1, 'Reply must be at least 1 character.'),
	});

	const {
		register: registerReply,
		handleSubmit: handleSubmitReply,
		setValue: setValueReply,
		formState: { errors: errorsReply },
	} = useForm({ resolver: zodResolver(replySchema) });

	const handleCommentSubmit = async (data: FieldValues) => {
		setLoadingComment('newComment');
		await authPost(
			'/comment',
			{
				content: data.content,
				postId: id,
			},
			(message, auth?: boolean) => {
				toast.error(message);
				if (auth) {
					logout();
				}
			},
			(data) => {
				setCommentsData((prev) => ({
					...prev,
					comments: [data.comment, ...prev.comments],
				}));
				setValue('content', '');
			}
		);
		setLoadingComment('');
	};

	const handleReplySubmit = async (data: FieldValues) => {
		setLoadingComment(replyingTo!);
		await authPost(
			'/comment',
			{
				content: data.content,
				postId: id,
				parentComment: replyingTo,
			},
			(message: string, auth?: boolean) => {
				toast.error(message);
				if (auth) {
					logout();
				}
			},
			(data) => {
				setCommentsData((prevData) => ({
					...prevData,
					comments: prevData.comments.map((comment) => {
						if (comment._id === replyingTo) {
							return {
								...comment,
								replies: [data.comment, ...comment.replies],
							};
						}
						return comment;
					}),
				}));
				setValueReply('content', '');
				setReplyingTo('');
			}
		);
		setLoadingComment('');
	};

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
				setCocktail((prev) => {
					const updatedLikes = prev.likes.includes(user._id)
						? prev.likes.filter((id) => id !== user._id)
						: [...prev.likes, user._id];
					return {
						...prev,
						likes: updatedLikes,
						likeCount: updatedLikes.length,
					};
				});
			}
		);
	};

	const handleCommentLike = async (commentId: string) => {
		await authPost(
			`/comment/${commentId}/like`,
			{},
			(message: string, auth?: boolean) => {
				toast.error(message);
				if (auth) {
					logout();
				}
			},
			() => {
				setCommentsData((prev) => ({
					...prev,
					comments: prev.comments.map((comment) => {
						if (comment._id === commentId)
							return {
								...comment,
								likes: comment.likes.includes(user._id)
									? comment.likes.filter(
											(id) => id !== user._id
									  )
									: [...comment.likes, user._id],
							};
						return comment;
					}),
				}));
			}
		);
	};

	const handleReplyLike = async (replyId: string) => {
		await authPost(
			`/comment/${replyId}/like`,
			{},
			(message: string, auth?: boolean) => {
				toast.error(message);
				if (auth) {
					logout();
				}
			},
			() => {
				setCommentsData((prev) => ({
					...prev,
					comments: prev.comments.map((comment) => {
						const updatedReplies = comment.replies.map((reply) => {
							if (reply._id === replyId)
								return {
									...reply,
									likes: reply.likes.includes(user._id)
										? reply.likes.filter(
												(id) => id !== user._id
										  )
										: [...reply.likes, user._id],
								};
							return reply;
						});
						return {
							...comment,
							replies: updatedReplies,
						};
					}),
				}));
			}
		);
	};

	const getCocktail = async () => {
		await authGet(
			`/post/${id}`,
			(message, auth?: boolean) => {
				toast.error(message);
				if (auth) {
					logout();
				}
			},
			(data) => {
				if (data?.post) {
					setCocktail(data.post);
				} else {
					toast.error('Cocktail not found.');
				}
			}
		);
	};

	const getComments = async (page?: number) => {
		let result = false;
		await authGet(
			`/comment/${id}?page=${page || 1}`,
			(message: string, auth?: boolean) => {
				toast.error(message);
				if (auth) {
					logout();
				}
			},
			(data) => {
				setCommentsData({
					comments: [...commentsData.comments, ...data.comments],
					count: data.count,
					pages: data.pages,
				});
				result = true;
			}
		);
		return result;
	};

	const getReplies = async (commentId: string, page: number) => {
		await authGet(
			`/comment/${commentId}/replies?page=${page}`,
			(message: string, auth?: boolean) => {
				toast.error(message);
				if (auth) {
					logout();
				}
			},
			(data) => {
				setCommentsData((prev) => ({
					...prev,
					comments: prev.comments.map((comment) => {
						if (comment._id === commentId) {
							return {
								...comment,
								replies: [...comment.replies, ...data.replies],
							};
						}
						return comment;
					}),
				}));
			}
		);
	};

	const deleteComment = (commentId: string) => {
		setCommentsData((prev) => ({
			...prev,
			comments: prev.comments.filter(
				(comment) => comment._id !== commentId
			),
			count: prev.count - 1,
			pages: Math.ceil((prev.count - 1) / 5),
		}));
	};

	const deleteReply = (replyId: string, commentId: string) => {
		setCommentsData((prev) => ({
			...prev,
			comments: prev.comments.map((comment) => {
				if (comment._id === commentId) {
					return {
						...comment,
						repliesCount: comment.repliesCount - 1,
						replies: comment.replies.filter(
							(reply) => reply._id !== replyId
						),
					};
				}
				return comment;
			}),
		}));
	};

	const handleDeletePost = async () => {
		setIsLoading(true);
		setIsDeleteModalOpen('');
		await authDel(
			`/post/${id}`,
			(message: string, auth?: boolean) => {
				setIsLoading(false);
				toast.error(message);
				if (auth) {
					logout();
				}
			},
			() => {
				navigate(-1);
				setIsLoading(false);
			}
		);
	};

	const handleDeleteUser = (postId: string) => {
		setIsDeleteModalOpen(postId);
	};

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

	const getData = async () => {
		setIsLoading(true);
		const accessToken = await getAccessToken();
		if (!accessToken) {
			toast.error('Please login to continue');
			logout();
			return;
		}
		const promises = [getCocktail(), getComments()];
		await Promise.all(promises);
		setIsLoading(false);
	};

	useEffect(() => {
		if (id !== postId.current) {
			postId.current = id!;
			if (id) {
				setCocktail(cocktailDefault);
				getData();
			} else {
				toast.error('Invalid cocktail ID.');
			}
		}
	}, [id]);

	if (isLoading) {
		return <Loader />;
	}

	return (
		<div className="min-h-screen bg-[#1a1a1a] text-white p-4">
			<div className="max-w-4xl mx-auto bg-[#212121] rounded-3xl shadow-xl overflow-hidden">
				<div className="p-4 flex items-center justify-between">
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
				<Carousel
					showThumbs={false}
					showStatus={false}
					infiniteLoop={true}
					emulateTouch={true}
					swipeable={true}
					dynamicHeight={true}
					onClickItem={(index) => {
						setPreviewImage(
							`${import.meta.env.VITE_API_ADDRESS}/${
								cocktail.images[index]
							}`
						);
					}}
				>
					{cocktail.images.map((image, index) => (
						<div key={index} className="cursor-pointer">
							<img
								src={`${
									import.meta.env.VITE_API_ADDRESS
								}/${image}`}
								alt={`${cocktail._id} - Image ${index + 1}`}
								className="w-full object-contain max-h-[600px]"
							/>
						</div>
					))}
				</Carousel>

				<div className="p-8">
					<RedTitle title="Cocktail" />
					<h1 className="mt-2 text-3xl leading-8 font-bold">
						{cocktail.title}
					</h1>
					<p className="mt-2 text-gray-400">{cocktail.description}</p>
					{cocktail.ai && <ShiningText text="Generated with AI" />}

					<div className="mt-6 flex flex-col md:flex-row items-center gap-4 md:gap-0 md:space-x-4">
						<LikeButton
							itemId={cocktail._id}
							likeAction={handlePostLike}
							likeCount={cocktail.likes.length}
							isLiked={cocktail.likes.includes(user._id)}
						/>
						<CounterButton
							onClick={() => {}}
							label="Comments"
							Icon={FaComment}
							count={cocktail.commentCount}
						/>
					</div>

					<div className="mt-8">
						<h2 className="text-2xl font-bold mb-4 flex items-center">
							<FaGlassMartiniAlt className="mr-2" /> Ingredients
						</h2>
						<ul className="list-disc list-inside space-y-2">
							{cocktail.ingredients.map((ingredient, index) => (
								<li key={index}>
									<span className="font-semibold">
										{ingredient.amount}
									</span>{' '}
									{ingredient.name}
								</li>
							))}
						</ul>
					</div>

					<div className="mt-8">
						<h2 className="text-2xl font-bold mb-4 flex items-center">
							<FaListUl className="mr-2" /> Instructions
						</h2>
						<ol className="list-decimal list-inside space-y-2">
							{cocktail.instructions.map((instruction, index) => (
								<li key={index} className="mb-2">
									{instruction}
								</li>
							))}
						</ol>
					</div>

					<div className="mt-8">
						<h2 className="text-2xl font-bold mb-4">Comments</h2>
						<form
							onSubmit={handleSubmit(handleCommentSubmit)}
							className="mb-4"
						>
							<CreateComment
								user={user}
								id="newComment"
								loadingComment={loadingComment}
								field="content"
								placeholder="Write a comment..."
								register={register}
								errors={errors}
							/>
						</form>
						<CommentList
							comments={commentsData.comments}
							loadingComment={loadingComment}
							fetchMore={getComments}
							pages={commentsData.pages}
							replyingTo={replyingTo}
							handleSubmitReply={handleSubmitReply}
							handleCommentLike={handleCommentLike}
							handleReplyLike={handleReplyLike}
							handleReplySubmit={handleReplySubmit}
							registerReply={registerReply}
							errorsReply={errorsReply}
							setReplyingTo={setReplyingTo}
							getReplies={getReplies}
							deleteComment={deleteComment}
							deleteReply={deleteReply}
						/>
					</div>
				</div>
			</div>
			<Modal
				isOpen={isDeleteModalOpen !== ''}
				onClose={() => setIsDeleteModalOpen('')}
				onConfirm={handleDeletePost}
				title="Are you absolutely sure?"
				description="This action cannot be undone. This will permanently delete the cocktail and its comments and remove it from our servers."
				confirmText="Delete Cocktail"
				cancelText="Cancel"
			/>
			<ImagePreview
				previewImageSrc={previewImage}
				setPreviewImageSrc={setPreviewImage}
			/>
		</div>
	);
};

export default CocktailDisplay;
