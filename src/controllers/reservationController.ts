import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";
import {
  Reservation,
  Space,
  User,
  ReservationHistory,
  sequelize,
} from "../models";
import { CustomError } from "../middlewares/errorHandler";

// Extend Request to include user property from auth middlewares
interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

// Create a new Reservation
export const createReservation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const t = await sequelize.transaction(); // Start a transaction

  try {
    const { space_id, start_time, end_time } = req.body;
    const user_id = req.user?.id; // Get user ID from authenticated token

    if (!user_id || !space_id || !start_time || !end_time) {
      throw new CustomError(
        "User ID, Space ID, start time, and end time are required.",
        400,
      );
    }

    const parsedStartTime = new Date(start_time);
    const parsedEndTime = new Date(end_time);

    if (parsedEndTime <= parsedStartTime) {
      throw new CustomError("End time must be after start time.", 400);
    }
    if (parsedStartTime < new Date()) {
      throw new CustomError("Reservation cannot be made in the past.", 400);
    }

    const space = await Space.findByPk(space_id, { transaction: t });
    if (!space) {
      throw new CustomError("Space not found.", 404);
    }
    if (!space.isAvailable) {
      throw new CustomError(
        "This space is currently not available for reservation.",
        400,
      );
    }

    // Check for overlapping reservations for the same space
    const existingReservations = await Reservation.findOne({
      where: {
        space_id,
        [Op.or]: [
          {
            start_time: {
              [Op.lt]: parsedEndTime, // Existing reservation starts before new one ends
            },
            end_time: {
              [Op.gt]: parsedStartTime, // Existing reservation ends after new one starts
            },
          },
        ],
        status: {
          [Op.in]: ["pendente", "confirmada"], // Only consider pending or confirmed reservations
        },
      },
      transaction: t,
    });

    if (existingReservations) {
      throw new CustomError(
        "Space is already reserved for part or all of the requested time slot.",
        409,
      );
    }

    const newReservation = await Reservation.create(
      {
        space_id,
        user_id,
        start_time: parsedStartTime,
        end_time: parsedEndTime,
        status: "pendente", // Default status
      },
      { transaction: t },
    );

    // Record reservation history
    await ReservationHistory.create(
      {
        reservation_id: newReservation.id,
        action: "created",
        action_user: user_id,
        details: `Reservation created by user ${user_id}`,
      },
      { transaction: t },
    );

    await t.commit(); // Commit the transaction

    res.status(201).json({
      message: "Reservation created successfully",
      reservation: newReservation,
    });
  } catch (error) {
    await t.rollback(); // Rollback on error
    next(error);
  }
};

// Get all Reservations (Admin/Manager only)
export const getAllReservations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const reservations = await Reservation.findAll({
      include: [
        { model: Space, as: "space" },
        { model: User, as: "user", attributes: ["id", "name", "email"] },
      ],
    });
    res.status(200).json(reservations);
  } catch (error) {
    next(error);
  }
};

// Get a single Reservation by ID (User if their reservation, Manager/Admin for any)
export const getReservationById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const reservation = await Reservation.findByPk(id, {
      include: [
        { model: Space, as: "space" },
        { model: User, as: "user", attributes: ["id", "name", "email"] },
      ],
    });

    if (!reservation) {
      throw new CustomError("Reservation not found.", 404);
    }

    // Authorization: User can only see their own reservation, managers/admins can see any.
    if (userRole === "regular" && reservation.user_id !== userId) {
      throw new CustomError(
        "Forbidden: You do not have permission to view this reservation.",
        403,
      );
    }

    // If manager, check if it's a space they manage (optional but good practice)
    // const space = await Space.findByPk(reservation.space_id);
    // if (userRole === 'manager' && space && space.manager_id !== userId) {
    //   throw new CustomError('Forbidden: You do not have permission to view this reservation.', 403);
    // }

    res.status(200).json(reservation);
  } catch (error) {
    next(error);
  }
};

// Get Reservations for the authenticated user
export const getMyReservations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new CustomError("Authentication required.", 401);
    }

    const reservations = await Reservation.findAll({
      where: { user_id: userId },
      include: [
        { model: Space, as: "space" },
        { model: User, as: "user", attributes: ["id", "name", "email"] },
      ],
      order: [["start_time", "ASC"]],
    });

    res.status(200).json(reservations);
  } catch (error) {
    next(error);
  }
};

// Update Reservation Status (Manager/Admin only)
export const updateReservationStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    if (
      !status ||
      !["pendente", "confirmada", "cancelada", "concluida"].includes(status)
    ) {
      throw new CustomError("Invalid status provided.", 400);
    }

    const reservation = await Reservation.findByPk(id, { transaction: t });

    if (!reservation) {
      throw new CustomError("Reservation not found.", 404);
    }

    // Prevent changing status of already cancelled/completed reservations (unless forced)
    if (["cancelada", "concluida"].includes(reservation.status)) {
      throw new CustomError(
        `Cannot change status of a ${reservation.status} reservation.`,
        400,
      );
    }

    const oldStatus = reservation.status;
    reservation.status = status;
    await reservation.save({ transaction: t });

    // Record history
    await ReservationHistory.create(
      {
        reservation_id: reservation.id,
        action: `status_changed_from_${oldStatus}_to_${status}`,
        action_user: userId,
        details: `Reservation status updated by ${req.user?.role} (ID: ${userId})`,
      },
      { transaction: t },
    );

    await t.commit();

    res.status(200).json({
      message: "Reservation status updated successfully",
      reservation,
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// Cancel a Reservation (User for their own, Manager/Admin for any)
export const cancelReservation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const reservation = await Reservation.findByPk(id, { transaction: t });

    if (!reservation) {
      throw new CustomError("Reservation not found.", 404);
    }

    // Authorization: Regular user can only cancel their own, Managers/Admins can cancel any
    if (userRole === "regular" && reservation.user_id !== userId) {
      throw new CustomError(
        "Forbidden: You do not have permission to cancel this reservation.",
        403,
      );
    }

    // Disallow cancelling past or already completed reservations
    if (
      new Date() > reservation.end_time ||
      reservation.status === "concluida"
    ) {
      throw new CustomError(
        "Cannot cancel a past or completed reservation.",
        400,
      );
    }
    if (reservation.status === "cancelada") {
      throw new CustomError("Reservation is already cancelled.", 400);
    }

    reservation.status = "cancelada";
    await reservation.save({ transaction: t });

    // Record history
    await ReservationHistory.create(
      {
        reservation_id: reservation.id,
        action: "cancelled",
        action_user: userId,
        details: `Reservation cancelled by ${userRole} (ID: ${userId})`,
      },
      { transaction: t },
    );

    await t.commit();

    res
      .status(200)
      .json({ message: "Reservation cancelled successfully", reservation });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};
