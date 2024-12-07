import express, { Express } from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import mongoSanitize from 'express-mongo-sanitize';
import errorHandler from './middleware/errorMiddleware';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './doc/swagger';
import userRoutes from './routes/userRoutes';
import './types/types';

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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/user', userRoutes);

app.use(errorHandler);

export default app;
