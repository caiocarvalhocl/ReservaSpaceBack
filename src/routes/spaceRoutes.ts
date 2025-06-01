import { Router } from 'express';
import {
  authenticateToken,
  authorizeRole,
} from '../middlewares/authMiddleware';
import {
  createSpace,
  getAllSpaces,
  getSpaceById,
  updateSpace,
  deleteSpace,
} from '../controllers/spaceController';

export const spaceRoutes = Router();

// Create a new space (Accessible by Admin or Manager)
spaceRoutes.post(
  '/',
  authenticateToken,
  authorizeRole(['admin', 'manager']),
  createSpace,
);

// Get all spaces (Accessible by any authenticated user)
spaceRoutes.get('/', getAllSpaces);

// Get a single space by ID (Accessible by any authenticated user)
spaceRoutes.get('/:id', authenticateToken, getSpaceById);

// Update a space (Accessible by Admin or the manager of that space)
spaceRoutes.put(
  '/:id',
  authenticateToken,
  authorizeRole(['admin', 'manager']),
  updateSpace,
);

// Delete a space (Accessible by Admin or the manager of that space)
spaceRoutes.delete(
  '/:id',
  authenticateToken,
  authorizeRole(['admin', 'manager']),
  deleteSpace,
);
