import React from "react";
import { IComment } from "../types/comment";
import LikeButton from "./LikeButton";
import { UserPost } from "../types/user";
import ItemUser from "./ItemUser";

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

    return (
        <div className="p-4 bg-[#2a2a2a] rounded-xl shadow-md">
            <div className="p-4 flex items-center">
                <ItemUser user={comment.user} createdAt={comment.createdAt} />
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
                <span className="text-gray-500">
                    {comment.replies.length} Replies
                </span>
            </div>
        </div>
    );
};

export default CommentItem;
