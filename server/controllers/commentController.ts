import Comment from '../models/commentModel';

const deleteUserCommentsAndReplies = async (userId: string): Promise<void> => {
	let promises: Promise<any>[] = [];
	const userComments = await Comment.find({ user: userId });
	for (let comment of userComments) {
		for (let reply of comment.replies) {
			promises.push(Comment.findByIdAndDelete(reply));
		}
		promises.push(Comment.findByIdAndDelete(comment._id));
	}
	await Promise.all(promises);
};


export { deleteUserCommentsAndReplies };