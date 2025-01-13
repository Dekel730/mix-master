import React, { useState, useEffect } from "react";
import { FaGlassMartiniAlt, FaListUl, FaComment } from "react-icons/fa";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Loader from "../components/Loader";
import { authGet } from "../utils/requests";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import LikeButton from "../components/LikeButton";
import { BsSendFill } from "react-icons/bs";
import { getUserPicture } from "../utils/functions";

interface Comment {
    id: number;
    user: string;
    userImage: string;
    text: string;
    likes: number;
    replies: Reply[];
}

interface Reply {
    id: number;
    user: string;
    userImage: string;
    text: string;
}

const CocktailDisplay: React.FC = () => {
    const [cocktail, setCocktail] = useState<{
        _id: string;
        title: string;
        description: string;
        ingredients: { amount: string; name: string }[];
        instructions: string[];
        images: string[];
        likes: string[]; // מוסיפים את מערך הלייקים
        likeCount: number; // סופר הלייקים
        commentCount: number; // סופר התגובות
    }>({
        _id: "",
        title: "",
        description: "",
        ingredients: [],
        instructions: [],
        images: [],
        likes: [],
        likeCount: 0,
        commentCount: 0,
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [comments, setComments] = useState<Comment[]>([
        {
            id: 1,
            user: "CocktailLover",
            userImage: "/placeholder.svg?height=40&width=40&text=CL",
            text: "This looks amazing! Can't wait to try it.",
            likes: 5,
            replies: [
                {
                    id: 1,
                    user: "MixMaster",
                    userImage: "/placeholder.svg?height=40&width=40&text=MM",
                    text: "Thank you! Let me know how it turns out.",
                },
                {
                    id: 2,
                    user: "NewbieMixer",
                    userImage: "/placeholder.svg?height=40&width=40&text=NM",
                    text: "I made this last night, it was delicious!",
                },
            ],
        },
        {
            id: 2,
            user: "TropicalFan",
            //userImage: "/placeholder.svg?height=40&width=40&text=TF",
            userImage: "https://example.com/images/users/cocktaillover.png",
            text: "Perfect for a beach day!",
            likes: 3,
            replies: [],
        },
    ]);
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [newReply, setNewReply] = useState("");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const { id } = useParams<{ id: string }>();

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim()) {
            setComments([
                ...comments,
                {
                    id: comments.length + 1,
                    user: "CurrentUser",
                    userImage:
                        "https://example.com/images/users/cocktaillover.png",
                    text: newComment,
                    likes: 0,
                    replies: [],
                },
            ]);
            setNewComment("");
        }
    };

    const handleReplySubmit = (commentId: number) => {
        if (newReply.trim()) {
            setComments(
                comments.map((comment) =>
                    comment.id === commentId
                        ? {
                              ...comment,
                              replies: [
                                  ...comment.replies,
                                  {
                                      id: comment.replies.length + 1,
                                      user: "CurrentUser",
                                      userImage:
                                          "/placeholder.svg?height=40&width=40&text=CU", // כאן מוסיפים את תמונת המשתמש
                                      text: newReply,
                                  },
                              ],
                          }
                        : comment
                )
            );
            setNewReply("");
            setReplyingTo(null);
        }
    };

    const getCocktail = async () => {
        setIsLoading(true);
        await authGet(
            `/post/${id}`,
            (message) => {
                toast.error(message);
            },
            (data) => {
                if (data?.post) {
                    setCocktail(data.post);
                } else {
                    toast.error("Cocktail not found.");
                }
            }
        );
        setIsLoading(false);
    };

    useEffect(() => {
        if (id) {
            getCocktail();
        } else {
            toast.error("Invalid cocktail ID.");
        }
    }, [id]);

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white p-4">
            <div className="max-w-4xl mx-auto bg-[#212121] rounded-3xl shadow-xl overflow-hidden">
                <Carousel
                    showThumbs={false}
                    showStatus={false}
                    infiniteLoop={true}
                    emulateTouch={true}
                    swipeable={true}
                    dynamicHeight={true}
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
                    <div className="uppercase tracking-wide text-sm text-[#D93025] font-semibold">
                        Cocktail
                    </div>
                    <h1 className="mt-2 text-3xl leading-8 font-bold">
                        {cocktail.title}
                    </h1>
                    <p className="mt-2 text-gray-400">{cocktail.description}</p>

                    <div className="mt-6 flex items-center">
                        <LikeButton
                            itemId={cocktail._id}
                            initialLikes={cocktail.likes}
                            initialLikeCount={cocktail.likeCount}
                            onLikeChange={(updatedCocktail) => {
                                setCocktail({
                                    ...cocktail,
                                    likes: updatedCocktail.likes,
                                    likeCount: updatedCocktail.likeCount,
                                });
                            }}
                        />
                        <button className="ml-4 flex items-center transition-colors cursor-default">
                            <FaComment className="mr-2" />
                            {cocktail.commentCount}
                        </button>
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
                                    </span>{" "}
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
                        <form onSubmit={handleCommentSubmit} className="mb-4">
                            <div className="flex items-center">
                                <img
                                    src={getUserPicture(user)}
                                    alt="Current User"
                                    className="w-10 h-10 rounded-full mr-2"
                                />
                                <div className="flex-grow">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) =>
                                            setNewComment(e.target.value)
                                        }
                                        placeholder="Write a comment..."
                                        className="w-full bg-[#1a1a1a] text-white h-12 rounded-xl px-4 outline-none focus:ring-2 focus:ring-gray-500 transition-all"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-[#D93025] hover:bg-[#bf2b1a] text-white py-2 px-6 rounded-xl ml-2 flex items-center justify-center"
                                >
                                    <BsSendFill size={20} />
                                </button>
                            </div>
                        </form>
                        <div>
                            {comments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className="mb-6 border-b border-gray-600 pb-6"
                                >
                                    <div className="flex items-center mb-2">
                                        <img
                                            src={comment.userImage}
                                            alt={comment.user}
                                            className="w-10 h-10 rounded-full mr-2"
                                        />
                                        <div className="font-semibold text-white">
                                            {comment.user}
                                        </div>
                                    </div>
                                    <p className="text-gray-400 mb-4">
                                        {comment.text}
                                    </p>
                                    <div className="flex items-center text-gray-500">
                                        <button
                                            className="mr-4"
                                            onClick={() =>
                                                setReplyingTo(comment.id)
                                            }
                                        >
                                            Reply
                                        </button>
                                        <span>{comment.likes} Likes</span>
                                    </div>
                                    {replyingTo === comment.id && (
                                        <div className="mt-4 flex">
                                            <textarea
                                                value={newReply}
                                                onChange={(e) =>
                                                    setNewReply(e.target.value)
                                                }
                                                placeholder="Write a reply..."
                                                className="w-full bg-[#1a1a1a] text-white h-12 rounded-l-xl px-4 outline-none focus:ring-2 focus:ring-gray-500 transition-all"
                                            />
                                            <button
                                                onClick={() =>
                                                    handleReplySubmit(
                                                        comment.id
                                                    )
                                                }
                                                className="bg-[#D93025] hover:bg-[#bf2b1a] text-white py-2 px-6 rounded-r-xl"
                                            >
                                                Reply
                                            </button>
                                        </div>
                                    )}
                                    {comment.replies.length > 0 && (
                                        <div className="mt-4">
                                            {comment.replies.map((reply) => (
                                                <div
                                                    key={reply.id}
                                                    className="ml-8 mb-4 flex items-center"
                                                >
                                                    <img
                                                        src={reply.userImage} // תמונת המשתמש בתשובה
                                                        alt={reply.user}
                                                        className="w-8 h-8 rounded-full mr-2"
                                                    />
                                                    <div>
                                                        <div className="font-semibold text-white">
                                                            {reply.user}
                                                        </div>
                                                        <p className="text-gray-400">
                                                            {reply.text}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CocktailDisplay;
