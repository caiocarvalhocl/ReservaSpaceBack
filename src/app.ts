import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';
import { router } from './routes/routes';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';

const app = express();

app.use(express.json());
app.use(cors());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(router);

app.use(errorHandler);

export { app };
