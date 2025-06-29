import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { Reservation, Space, User, ReservationHistory, sequelize, SpaceResource, Resource } from '../models';
import { CustomError } from '../middlewares/errorHandler';

interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

export const createReservation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();

  try {
    const { spaceId, startTime, endTime } = req.body;
    const userId = req.user?.id;

    if (!userId || !spaceId || !startTime || !endTime) {
      throw new CustomError('User ID, Space ID, start time, and end time are required.', 400);
    }

    const parsedStartTime = new Date(startTime);
    const parsedEndTime = new Date(endTime);

    if (parsedEndTime <= parsedStartTime) {
      throw new CustomError('End time must be after start time.', 400);
    }
    if (parsedStartTime < new Date()) {
      throw new CustomError('Reservation cannot be made in the past.', 400);
    }

    const space = await Space.findByPk(spaceId, { transaction: t });

    if (!space) {
      throw new CustomError('Space not found.', 404);
    }
    if (!space.isAvailable) {
      throw new CustomError('This space is currently not available for reservation.', 400);
    }

    const existingReservations = await Reservation.findOne({
      where: {
        spaceId,
        [Op.or]: [
          {
            startTime: {
              [Op.lt]: parsedEndTime,
            },
            endTime: {
              [Op.gt]: parsedStartTime,
            },
          },
        ],
        status: {
          [Op.in]: ['pendente', 'confirmada'],
        },
      },
      transaction: t,
    });

    if (existingReservations) {
      throw new CustomError('Space is already reserved for part or all of the requested time slot.', 409);
    }

    const newReservation = await Reservation.create(
      {
        spaceId,
        userId,
        startTime: parsedStartTime,
        endTime: parsedEndTime,
        status: 'pending',
      },
      { transaction: t },
    );

    await ReservationHistory.create(
      {
        reservationId: newReservation.id,
        action: 'created',
        actionUser: userId,
        details: `Reservation created by user ${userId}`,
      },
      { transaction: t },
    );

    await t.commit();

    res.status(201).json({
      message: 'Reservation created successfully',
      reservation: newReservation,
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const getAllReservations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const reservations = await Reservation.findAll({
      include: [
        { model: Space, as: 'space' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      ],
    });
    res.status(200).json(reservations);
  } catch (error) {
    next(error);
  }
};

export const getReservationById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const reservation = await Reservation.findByPk(id, {
      include: [
        { model: Space, as: 'space' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      ],
    });

    if (!reservation) {
      throw new CustomError('Reservation not found.', 404);
    }

    if (userRole === 'regular' && reservation.userId !== userId) {
      throw new CustomError('Forbidden: You do not have permission to view this reservation.', 403);
    }

    res.status(200).json(reservation);
  } catch (error) {
    next(error);
  }
};

export const getMyReservations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new CustomError('Authentication required.', 401);
    }

    const reservations = await Reservation.findAll({
      where: { userId },
      include: [
        {
          model: Space,
          as: 'space',
          attributes: ['id', 'name', 'type', 'capacity', 'imageUrl', 'price', 'description', 'isAvailable'],
          include: [
            {
              model: SpaceResource,
              as: 'spaceResources',
              attributes: ['quantity'],
              include: [
                {
                  model: Resource,
                  as: 'resource',
                  attributes: ['id', 'name', 'description', 'availableQuantity'],
                },
              ],
            },
          ],
        },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      ],
      order: [['startTime', 'ASC']],
    });

    res.status(200).json(reservations);
  } catch (error) {
    next(error);
  }
};

export const updateReservationStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    if (!status || !['pending', 'confirmed', 'canceled', 'completed'].includes(status)) {
      throw new CustomError('Invalid status provided.', 400);
    }

    const reservation = await Reservation.findByPk(id, { transaction: t });

    if (!reservation) {
      throw new CustomError('Reservation not found.', 404);
    }

    if (['canceled', 'completed'].includes(reservation.status)) {
      throw new CustomError(`Cannot change status of a ${reservation.status} reservation.`, 400);
    }

    const oldStatus = reservation.status;
    reservation.status = status;
    await reservation.save({ transaction: t });

    await ReservationHistory.create(
      {
        reservationId: reservation.id,
        action: `status_changed_from_${oldStatus}_to_${status}`,
        actionUser: userId,
        details: `Reservation status updated by ${req.user?.role} (ID: ${userId})`,
      },
      { transaction: t },
    );

    await t.commit();

    res.status(200).json({
      message: 'Reservation status updated successfully',
      reservation,
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const cancelReservation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const reservation = await Reservation.findByPk(id, { transaction: t });

    if (!reservation) {
      throw new CustomError('Reservation not found.', 404);
    }

    if (userRole === 'regular' && reservation.userId !== userId) {
      throw new CustomError('Forbidden: You do not have permission to cancel this reservation.', 403);
    }

    if (new Date() > reservation.endTime || reservation.status === 'completed') {
      throw new CustomError('Cannot cancel a past or completed reservation.', 400);
    }
    if (reservation.status === 'canceled') {
      throw new CustomError('Reservation is already cancelled.', 400);
    }

    reservation.status = 'canceled';
    await reservation.save({ transaction: t });

    await ReservationHistory.create(
      {
        reservationId: reservation.id,
        action: 'cancelled',
        actionUser: userId,
        details: `Reservation cancelled by ${userRole} (ID: ${userId})`,
      },
      { transaction: t },
    );

    await t.commit();

    res.status(200).json({ message: 'Reservation cancelled successfully', reservation });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};
