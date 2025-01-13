import { UserPost } from "./user";

export interface IComment {
    _id: string;
    user: UserPost;
    parentComment?: string;
    content: string;
    likes: string[];
    replies: IComment[];
    createdAt: string;
};

export interface CommentData {
    comments: IComment[];
    count: number;
    pages: number;
};

export const defaultCommentData: CommentData = {
    comments: [],
    count: 0,
    pages: 0,
};