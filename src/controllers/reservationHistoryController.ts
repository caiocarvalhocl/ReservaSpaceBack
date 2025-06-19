import { Request, Response, NextFunction } from 'express';
import { ReservationHistory, Reservation, User } from '../models';
import { CustomError } from '../middlewares/errorHandler';

interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

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
      throw new CustomError('Reservation not found.', 404);
    }

    if (userRole === 'regular' && reservation.userId !== userId) {
      throw new CustomError(
        'Forbidden: You do not have permission to view this reservation history.',
        403,
      );
    }

    const history = await ReservationHistory.findAll({
      where: { reservationId },
      include: [
        {
          model: User,
          as: 'actionByUser',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['actionDate', 'ASC']],
    });

    res.status(200).json(history);
  } catch (error) {
    next(error);
  }
};

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
          as: 'reservation',
          attributes: ['id', 'spaceId', 'userId', 'startTime', 'endTime'],
        },
        {
          model: User,
          as: 'actionByUser',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['actionDate', 'DESC']],
    });
    res.status(200).json(history);
  } catch (error) {
    next(error);
  }
};
