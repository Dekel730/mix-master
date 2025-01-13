// CommentDisplay.tsx
import React from "react";
import { IComment } from "../types/comment"; 

interface CommentDisplayProps {
    comment: IComment;
    likeUnlike: (comment: IComment) => void;
}

const CommentDisplay = ({ comment, likeUnlike }: CommentDisplayProps) => {
    return (
        <div className="comment">
            <div className="comment-header">
                <img
                    src={comment.user.picture}
                    alt={`${comment.user.f_name} ${comment.user.l_name}`}
                    className="avatar"
                />
                <div className="user-info">
                    <span className="user-name">
                        {comment.user.f_name} {comment.user.l_name}
                    </span>
                    <span className="comment-date">{comment.createdAt}</span>
                </div>
            </div>
            <div className="comment-content">{comment.content}</div>
            <div className="comment-actions">
                <button onClick={() => likeUnlike(comment)}>
                    {comment.likes.length} Likes
                </button>
            </div>
        </div>
    );
};

export default CommentDisplay;
