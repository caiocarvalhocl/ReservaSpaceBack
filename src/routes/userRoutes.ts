import { Router } from 'express';
import {
  register,
  login,
  getUsers,
  getUserById,
  getMyProfile,
} from '../controllers/userController';
import {
  authenticateToken,
  authorizeRole,
} from '../middlewares/authMiddleware';

export const userRoutes = Router();

userRoutes.get('/me', authenticateToken, getMyProfile); // Get current user's profile
userRoutes.get('/', authenticateToken, authorizeRole(['admin']), getUsers); // Only admins can list all users
userRoutes.get(
  '/:id',
  authenticateToken,
  authorizeRole(['admin']),
  getUserById,
);

userRoutes.post('/login', login);
userRoutes.post('/register', register);
