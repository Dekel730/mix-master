import { UserPost } from "./user";

export interface IComment {
    _id: string;
    user: UserPost;
    parentComment?: string;
    content: string;
    likes: string[];
    replies: IComment[];
};