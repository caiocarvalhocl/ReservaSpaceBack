import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware';
import { createResource, getAllResources, getResourceById, updateResource, deleteResource } from '../controllers/resourceController';

export const resourceRoutes = Router();

resourceRoutes.post('/', authenticateToken, authorizeRole(['admin']), createResource);
resourceRoutes.get('/', authenticateToken, getAllResources);
resourceRoutes.get('/:id', authenticateToken, getResourceById);
resourceRoutes.put('/:id', authenticateToken, authorizeRole(['admin']), updateResource);
resourceRoutes.delete('/:id', authenticateToken, authorizeRole(['admin']), deleteResource);
