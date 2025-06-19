import { Router } from 'express';
import {
  authenticateToken,
  authorizeRole,
} from '../middlewares/authMiddleware';
import {
  addOrUpdateSpaceResource,
  getResourcesForSpace,
  removeResourceFromSpace,
} from '../controllers/spaceResourceController';

export const spaceResourceRoutes = Router();

spaceResourceRoutes.post(
  '/',
  authenticateToken,
  authorizeRole(['admin', 'manager']),
  addOrUpdateSpaceResource,
);
spaceResourceRoutes.get('/:spaceId', authenticateToken, getResourcesForSpace);
spaceResourceRoutes.delete(
  '/:spaceId/:resourceId',
  authenticateToken,
  authorizeRole(['admin', 'manager']),
  removeResourceFromSpace,
);
