import React from "react";
import { IComment } from "../types/comment";
import { getUserPicture } from "../utils/functions";
import LikeButton from "./LikeButton";
import { UserPost } from "../types/user";
import { useNavigate } from "react-router-dom";

interface CommentItemProps {
    comment: IComment;
    reply: (commentId: string) => void;
    commentLike: (commentId: string) => Promise<void>;
    openReply: string;
    user: UserPost;
}

const CommentItem: React.FC<CommentItemProps> = ({
    comment,
    reply,
    openReply,
    user,
    commentLike,
}) => {
    const handleReply = (commentId: string) => {
        if (openReply === commentId) {
            reply("");
            return;
        }
        reply(commentId);
    };

    const navigate = useNavigate();

    const handleProfileClick = (userId: string) => {
        navigate(`/user/${userId}`);
    };

    return (
        <div className="p-4 bg-[#2a2a2a] rounded-xl shadow-md">
            <div className="flex items-center mb-2">
                <img
                    src={getUserPicture(comment.user)}
                    alt={comment.user._id}
                    className="w-10 h-10 rounded-full mr-2 cursor-pointer"
                    onClick={() => handleProfileClick(comment.user._id)}
                />
                <div
                    className="font-semibold text-white hover:text-red-500 hover:underline cursor-pointer"
                    onClick={() => handleProfileClick(comment.user._id)} 
                >
                    {comment.user.f_name} {comment.user.l_name}
                </div>
            </div>
            <p className="text-gray-400 mb-4 ml-8">{comment.content}</p>
            <div className="flex items-center gap-4">
                <LikeButton
                    itemId={comment._id}
                    likeAction={commentLike}
                    likeCount={comment.likes.length}
                    isLiked={comment.likes.includes(user._id)}
                />
                <button
                    className="flex items-center text-gray-500 space-x-2 px-4 py-2 rounded-md"
                    onClick={() => handleReply(comment._id)}
                >
                    Reply
                </button>
                <span className="text-gray-500" >
                    {comment.replies.length} Replies
                </span>
            </div>
        </div>
    );
};

export default CommentItem;
