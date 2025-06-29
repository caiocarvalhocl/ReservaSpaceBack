import { Request, Response, NextFunction } from 'express';
import { Space, User, SpaceResource, Resource, Reservation } from '../models';
import { CustomError } from '../middlewares/errorHandler';
import { Op } from 'sequelize';

interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

export const createSpace = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, type, capacity, price, description, managerId, status, imageUrl } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!name || !type || capacity === undefined || capacity < 0) {
      throw new CustomError('Name, type, and capacity are required.', 400);
    }

    const managerExists = await User.findByPk(userId);
    if (!managerExists) return res.status(400).json({ message: 'User not found!' });

    const newSpace = await Space.create({
      name,
      type,
      capacity,
      description,
      price,
      managerId: userId,
      status,
      imageUrl,
      isAvailable: status === 'active' ? true : false,
    });

    res.status(201).json({ message: 'Space created successfully', space: newSpace });
  } catch (error) {
    next(error);
  }
};

export const getAllSpaces = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const spaces = await Space.findAll({
      where: {
        status: 'active',
      },
      include: [
        { model: User, as: 'manager', attributes: ['id', 'name', 'email'] },
        {
          model: SpaceResource,
          as: 'spaceResources',
          attributes: ['quantity'],
          include: [
            {
              model: Resource,
              as: 'resource',
              attributes: ['id', 'name', 'description'],
            },
          ],
        },
      ],
    });
    res.status(200).json(spaces);
  } catch (error) {
    next(error);
  }
};

export const getSpaceById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const space = await Space.findByPk(id, {
      include: [
        { model: User, as: 'manager', attributes: ['id', 'name', 'email'] },
        {
          model: SpaceResource,
          as: 'spaceResources',
          attributes: ['quantity'],
          include: [
            {
              model: Resource,
              as: 'resource',
              attributes: ['id', 'name', 'description'],
            },
          ],
        },
      ],
    });

    if (!space) {
      throw new CustomError('Space not found.', 404);
    }

    res.status(200).json(space);
  } catch (error) {
    next(error);
  }
};

export const getLastReservationForSpaceAndUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const spaceId = parseInt(req.params.spaceId, 10);

    if (!userId) {
      throw new CustomError('Usuário não autenticado.', 401);
    }

    if (isNaN(spaceId)) {
      throw new CustomError('ID do espaço inválido.', 400);
    }

    const lastReservation = await Reservation.findOne({
      where: {
        spaceId: spaceId,
        userId: userId,
      },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Space,
          as: 'space',
          attributes: ['id'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id'],
        },
      ],
    });

    if (!lastReservation) {
      return res.status(404).json({
        message: 'Nenhuma reserva encontrada para este espaço e usuário.',
      });
    }

    res.status(200).json(lastReservation);
  } catch (error) {
    next(error);
  }
};

export const getMySpaces = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new CustomError('User not authenticated.', 401);
    }

    const mySpaces = await Space.findAll({
      where: { managerId: userId },
      include: [
        { model: User, as: 'manager', attributes: ['id', 'name', 'email'] },
        {
          model: SpaceResource,
          as: 'spaceResources',
          attributes: ['quantity'],
          include: [
            {
              model: Resource,
              as: 'resource',
              attributes: ['id', 'name', 'description'],
            },
          ],
        },
        {
          model: Reservation,
          as: 'reservations',
          where: {
            status: {
              [Op.ne]: 'cancelada',
            },
          },
          order: [['createdAt', 'DESC']],
          attributes: ['createdAt', 'status', 'id'],
          limit: 1,
          required: false,
        },
      ],
    });

    res.status(200).json(mySpaces);
  } catch (error) {
    next(error);
  }
};

export const updateSpace = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, type, capacity, description, managerId, isAvailable } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const space = await Space.findByPk(id);

    if (!space) {
      throw new CustomError('Space not found.', 404);
    }

    if (userRole !== 'admin' && space.managerId !== userId) {
      throw new CustomError('Forbidden: You are not authorized to update this space.', 403);
    }

    if (managerId !== undefined && managerId !== space.managerId && userRole !== 'admin') {
      throw new CustomError('Forbidden: Only an admin can reassign a space manager.', 403);
    }

    if (managerId !== undefined && managerId !== space.managerId) {
      const newManager = await User.findByPk(managerId);
      if (!newManager) {
        throw new CustomError('Specified new manager ID does not exist.', 400);
      }
      if (newManager.role !== 'manager' && newManager.role !== 'admin') {
        throw new CustomError('A regular user cannot be assigned as a space manager.', 400);
      }
      space.managerId = managerId;
    }

    space.name = name || space.name;
    space.type = type || space.type;
    space.capacity = capacity !== undefined ? capacity : space.capacity;
    space.description = description || space.description;
    space.isAvailable = isAvailable !== undefined ? isAvailable : space.isAvailable;

    await space.save();

    res.status(200).json({ message: 'Space updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteSpace = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const space = await Space.findByPk(id);

    if (!space) {
      throw new CustomError('Space not found.', 404);
    }

    if (userRole !== 'admin' && space.managerId !== userId) {
      throw new CustomError('Forbidden: You are not authorized to delete this space.', 403);
    }

    await space.destroy();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
