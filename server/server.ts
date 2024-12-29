import express, { Express } from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import mongoSanitize from 'express-mongo-sanitize';
import errorHandler from './middleware/errorMiddleware';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './doc/swagger';
import userRoutes from './routes/userRoutes';
import postRoutes from './routes/postRoutes';
import './types/types';
import cors from 'cors';

dotenv.config();

const PORT = process.env.PORT || 3000;

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(mongoSanitize());

connectDB(() => {
	if (process.env.NODE_ENV !== 'test') {
		app.listen(PORT, () => {
			console.log(`server is running on port ${PORT}`);
		});
	}
});

app.use(
	cors({
		origin: process.env.HOST_ADDRESS,
		credentials: true,
	})
);

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', '*');
	res.header('Access-Control-Allow-Methods', '*');
	next();
});

// access to upload folder
app.use('/uploads', express.static('uploads'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/user', userRoutes);
app.use('/api/post', postRoutes);

app.use(errorHandler);

export default app;
