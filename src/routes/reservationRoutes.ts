import { Router } from 'express';
import {
  authenticateToken,
  authorizeRole,
} from '../middlewares/authMiddleware';
import {
  createReservation,
  getAllReservations,
  getReservationById,
  getMyReservations,
  updateReservationStatus,
  cancelReservation,
} from '../controllers/reservationController';
import {
  getHistoryForReservation,
  getAllReservationHistory,
} from '../controllers/reservationHistoryController';

export const reservationRoutes = Router();

reservationRoutes.post('/', authenticateToken, createReservation);
reservationRoutes.get('/my', authenticateToken, getMyReservations);
reservationRoutes.get(
  '/',
  authenticateToken,
  authorizeRole(['admin', 'manager']),
  getAllReservations,
);
reservationRoutes.get('/:id', authenticateToken, getReservationById);
reservationRoutes.put(
  '/:id/status',
  authenticateToken,
  authorizeRole(['admin', 'manager']),
  updateReservationStatus,
);
reservationRoutes.put('/:id/cancel', authenticateToken, cancelReservation);

reservationRoutes.get(
  '/:reservationId/history',
  authenticateToken,
  getHistoryForReservation,
);
reservationRoutes.get(
  '/history',
  authenticateToken,
  authorizeRole(['admin']),
  getAllReservationHistory,
);
