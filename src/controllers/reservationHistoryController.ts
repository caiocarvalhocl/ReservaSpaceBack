import { Request, Response, NextFunction } from "express";
import { ReservationHistory, Reservation, User } from "../models";
import { CustomError } from "../middlewares/errorHandler";

// Extend Request to include user property from auth middlewares
interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

// Get history for a specific reservation (User if their reservation, Manager/Admin for any)
export const getHistoryForReservation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { reservationId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const reservation = await Reservation.findByPk(reservationId);
    if (!reservation) {
      throw new CustomError("Reservation not found.", 404);
    }

    // Authorization: User can only see history for their own reservation, managers/admins can see any.
    if (userRole === "regular" && reservation.user_id !== userId) {
      throw new CustomError(
        "Forbidden: You do not have permission to view this reservation history.",
        403,
      );
    }

    // If manager, check if it's a space they manage (optional but good practice)
    // const space = await Space.findByPk(reservation.space_id);
    // if (userRole === 'manager' && space && space.manager_id !== userId) {
    //   throw new CustomError('Forbidden: You do not have permission to view this reservation history.', 403);
    // }

    const history = await ReservationHistory.findAll({
      where: { reservation_id: reservationId },
      include: [
        {
          model: User,
          as: "actionByUser",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["action_date", "ASC"]],
    });

    res.status(200).json(history);
  } catch (error) {
    next(error);
  }
};

// Optionally: Get all history entries (Admin only - could be very large)
export const getAllReservationHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const history = await ReservationHistory.findAll({
      include: [
        {
          model: Reservation,
          as: "reservation",
          attributes: ["id", "space_id", "user_id", "start_time", "end_time"],
        },
        {
          model: User,
          as: "actionByUser",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["action_date", "DESC"]],
    });
    res.status(200).json(history);
  } catch (error) {
    next(error);
  }
};
