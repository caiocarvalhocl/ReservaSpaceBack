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

/**
 * @swagger
 * /space-resources:
 *   post:
 *     summary: Add or update resources for a space
 *     tags: [Space Resources]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - spaceId
 *               - resourceId
 *               - quantity
 *             properties:
 *               spaceId:
 *                 type: integer
 *               resourceId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Resources added/updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
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
