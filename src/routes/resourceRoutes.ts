import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware';
import { createResource, getAllResources, getResourceById, updateResource, deleteResource } from '../controllers/resourceController';

export const resourceRoutes = Router();

/**
 * @swagger
 * /resources:
 *   post:
 *     summary: Create a new resource
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       201:
 *         description: Resource created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
resourceRoutes.post('/', authenticateToken, authorizeRole(['admin']), createResource);
/**
 * @swagger
 * /resources:
 *   get:
 *     summary: Get all resources
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of resources
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resource'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
resourceRoutes.get('/', authenticateToken, getAllResources);
resourceRoutes.get('/:id', authenticateToken, getResourceById);
resourceRoutes.put('/:id', authenticateToken, authorizeRole(['admin']), updateResource);
resourceRoutes.delete('/:id', authenticateToken, authorizeRole(['admin']), deleteResource);
