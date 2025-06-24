import { Router } from 'express';
import { getUsers, getUserById, getMyProfile, updateMultipleUsers, createUser } from '../controllers/userController';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware';

export const userRoutes = Router();

userRoutes.get('/me', authenticateToken, getMyProfile);
userRoutes.get('/', authenticateToken, authorizeRole(['admin']), getUsers);
userRoutes.get('/:id', authenticateToken, authorizeRole(['admin']), getUserById);

userRoutes.post('/', authenticateToken, authorizeRole(['admin']), createUser);
userRoutes.patch('/', authenticateToken, authorizeRole(['admin']), updateMultipleUsers);
