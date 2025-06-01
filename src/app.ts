import express from 'express';
import cors from 'cors';
import { sequelize } from './models'; // Import sequelize instance to sync models
import { config } from './config';
import { authRoutes } from './routes/authRoutes';
import { userRoutes } from './routes/userRoutes';
import { spaceRoutes } from './routes/spaceRoutes';
import { resourceRoutes } from './routes/resourceRoutes'; // New
import { spaceResourceRoutes } from './routes/spaceResourceRoutes'; // New
import { reservationRoutes } from './routes/reservationRoutes'; // Updated/New
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// Middleware
app.use(express.json()); // Body parser for JSON requests
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/spaces', spaceRoutes);
app.use('/api/resources', resourceRoutes); // New Route
app.use('/api/space-resources', spaceResourceRoutes); // New Route
app.use('/api/reservations', reservationRoutes); // New/Updated Route

// Error Handling Middleware (must be last middleware)
app.use(errorHandler);

export { app };
