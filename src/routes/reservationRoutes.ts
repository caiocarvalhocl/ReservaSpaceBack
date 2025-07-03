import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware';
import { createReservation, getAllReservations, getReservationById, getMyReservations, updateReservationStatus, cancelReservation } from '../controllers/reservationController';
import { getHistoryForReservation, getAllReservationHistory } from '../controllers/reservationHistoryController';

export const reservationRoutes = Router();

/**
 * @swagger
 * tags:
 *   name: Reservations
 *   description: API for managing reservations
 */

/**
 * @swagger
 * /reservations:
 *   post:
 *     summary: Create a new reservation
 *     tags: [Reservations]
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
 *               - startTime
 *               - endTime
 *             properties:
 *               spaceId:
 *                 type: integer
 *                 description: ID of the space being reserved
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: Start time of the reservation
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 description: End time of the reservation
 *     responses:
 *       201:
 *         description: Reservation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Bad request, invalid input or space not available
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
reservationRoutes.post('/', authenticateToken, createReservation);
reservationRoutes.get('/my', authenticateToken, getMyReservations);
reservationRoutes.get('/', authenticateToken, authorizeRole(['admin', 'manager']), getAllReservations);
reservationRoutes.get('/:id', authenticateToken, getReservationById);
reservationRoutes.put('/:id/status', authenticateToken, authorizeRole(['admin', 'manager']), updateReservationStatus);
reservationRoutes.put('/:id/cancel', authenticateToken, cancelReservation);

reservationRoutes.get('/:reservationId/history', authenticateToken, getHistoryForReservation);
reservationRoutes.get('/history', authenticateToken, authorizeRole(['admin']), getAllReservationHistory);
