import { Router } from "express";
import {
  authenticateToken,
  authorizeRole,
} from "../middlewares/authMiddleware";
import {
  createReservation,
  getAllReservations,
  getReservationById,
  getMyReservations,
  updateReservationStatus,
  cancelReservation,
} from "../controllers/reservationController";
import {
  getHistoryForReservation,
  getAllReservationHistory,
} from "../controllers/reservationHistoryController";

export const reservationRoutes = Router();

// Routes for Reservations
reservationRoutes.post("/", authenticateToken, createReservation); // Any authenticated user can create
reservationRoutes.get("/my", authenticateToken, getMyReservations); // Get reservations for the authenticated user
reservationRoutes.get(
  "/",
  authenticateToken,
  authorizeRole(["admin", "manager"]),
  getAllReservations,
); // Admin/Manager can view all
reservationRoutes.get("/:id", authenticateToken, getReservationById); // User can view their own, Admin/Manager can view any
reservationRoutes.put(
  "/:id/status",
  authenticateToken,
  authorizeRole(["admin", "manager"]),
  updateReservationStatus,
); // Admin/Manager to change status
reservationRoutes.put("/:id/cancel", authenticateToken, cancelReservation); // User for own, Admin/Manager for any

// Routes for Reservation History (nested under reservations)
reservationRoutes.get(
  "/:reservationId/history",
  authenticateToken,
  getHistoryForReservation,
); // User for their own, Admin/Manager for any
reservationRoutes.get(
  "/history",
  authenticateToken,
  authorizeRole(["admin"]),
  getAllReservationHistory,
); // Admin can view all history
