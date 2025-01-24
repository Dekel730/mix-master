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
import commentRoutes from './routes/commentRoutes';
import cocktailRoutes from './routes/cocktailRoutes';
import './types/types';
import cors from 'cors';
import fs from 'fs';
import http from 'http';
import https from 'https';
import path from 'path';

dotenv.config();

const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 443;

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(mongoSanitize());

connectDB(() => {
	if (process.env.NODE_ENV !== 'test') {
		if (process.env.NODE_ENV !== 'production') {
			http.createServer(app).listen(PORT, () => {
				console.log(`server is running on port ${PORT}`);
			});
		} else {
			const options = {
				key: fs.readFileSync('./client-key.pem'),
				cert: fs.readFileSync('./client-cert.pem'),
			};
			https.createServer(options, app).listen(HTTPS_PORT, () => {
				console.log(`server is running on port ${HTTPS_PORT}`);
			});
		}
	}
});

if (process.env.NODE_ENV === 'production') {
	app.use(express.static(path.join(__dirname, '../client')));

	app.get('*', (req, res) => {
		res.sendFile(path.join(__dirname, '../client', 'index.html'));
	});
}

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
app.use('/api/comment', commentRoutes);
app.use('/api/cocktail', cocktailRoutes);

app.use(errorHandler);

export default app;
