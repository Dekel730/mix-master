import mongoose from 'mongoose';
import colors from 'colors';

const connectDB = async (listen: () => void): Promise<void> => {
	try {
		const conn = await mongoose.connect(process.env.MONGO_URI as string);
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
