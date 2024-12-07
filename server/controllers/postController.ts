import Post from '../models/postModel';

const deleteUserPosts = async (userId: string): Promise<void> => {
	await Post.deleteMany({ user: userId });
};

export { deleteUserPosts };
