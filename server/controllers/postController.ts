import Post, { PostDocument } from '../models/postModel';

const deleteUserPosts = async (userId: string): Promise<PostDocument[]> => {
	const posts = await Post.find({ user: userId });
	await Post.deleteMany({ user: userId });
	return posts;
};

export { deleteUserPosts };
