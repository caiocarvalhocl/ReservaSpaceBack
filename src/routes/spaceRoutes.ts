import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware';
import { createSpace, getAllSpaces, getSpaceById, getMySpaces, updateSpace, deleteSpace } from '../controllers/spaceController';

export const spaceRoutes = Router();

spaceRoutes.post('/', authenticateToken, authorizeRole(['admin', 'manager']), createSpace);

spaceRoutes.get('/', getAllSpaces);

spaceRoutes.get('/my', authenticateToken, authorizeRole(['admin', 'manager']), getMySpaces);

spaceRoutes.get('/:id', authenticateToken, getSpaceById);

spaceRoutes.put('/:id', authenticateToken, authorizeRole(['admin', 'manager']), updateSpace);

spaceRoutes.delete('/:id', authenticateToken, authorizeRole(['admin', 'manager']), deleteSpace);
