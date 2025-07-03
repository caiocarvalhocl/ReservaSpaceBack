import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware';
import { createSpace, getAllSpaces, getSpaceById, getMySpaces, updateSpace, deleteSpace } from '../controllers/spaceController';

export const spaceRoutes = Router();

/**
 * @swagger
 * /spaces:
 *   post:
 *     summary: Create a new space
 *     tags: [Spaces]
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
 *               - description
 *               - capacity
 *               - location
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Space created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
spaceRoutes.post('/', authenticateToken, authorizeRole(['admin', 'manager']), createSpace);

/**
 * @swagger
 * /spaces:
 *   get:
 *     summary: Get all spaces
 *     tags: [Spaces]
 *     responses:
 *       200:
 *         description: A list of spaces
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Space'
 *       500:
 *         description: Server error
 */
spaceRoutes.get('/', getAllSpaces);

/**
 * @swagger
 * /spaces/my:
 *   get:
 *     summary: Get spaces created by the current user (admin or manager)
 *     tags: [Spaces]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of spaces created by the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Space'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
spaceRoutes.get('/my', authenticateToken, authorizeRole(['admin', 'manager']), getMySpaces);

/**
 * @swagger
 * /spaces/{id}:
 *   get:
 *     summary: Get a space by ID
 *     tags: [Spaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the space to retrieve
 *     responses:
 *       200:
 *         description: Space found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Space'
 *       404:
 *         description: Space not found
 *       500:
 *         description: Server error
 */
spaceRoutes.get('/:id', authenticateToken, getSpaceById);

/**
 * @swagger
 * /spaces/{id}:
 *   put:
 *     summary: Update a space by ID
 *     tags: [Spaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the space to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Space'
 *     responses:
 *       200:
 *         description: Space updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Space not found
 *       500:
 *         description: Server error
 */
spaceRoutes.put('/:id', authenticateToken, authorizeRole(['admin', 'manager']), updateSpace);

/**
 * @swagger
 * /spaces/{id}:
 *   delete:
 *     summary: Delete a space by ID
 *     tags: [Spaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the space to delete
 *     responses:
 *       200:
 *         description: Space deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Space not found
 *       500:
 *         description: Server error
 */
spaceRoutes.delete('/:id', authenticateToken, authorizeRole(['admin', 'manager']), deleteSpace);
