import mongoose from 'mongoose';
import colors from 'colors';

const connectDB = async (listen: () => void): Promise<void> => {
	try {
		const connectionUri =
			process.env.NODE_ENV === 'test'
				? process.env.MONGO_URI_TEST!
				: process.env.MONGO_URI!;
		const conn = await mongoose.connect(connectionUri);
		console.log(
			colors.cyan.underline(`MongoDB Connected: ${conn.connection.host}`)
		);
		listen();
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
};

export default connectDB;
