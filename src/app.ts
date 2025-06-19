import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';
import { router } from './routes/routes';

const app = express();

app.use(express.json());
app.use(cors());
app.use(router);

app.use(errorHandler);

export { app };
