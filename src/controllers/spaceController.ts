import { Request, Response, NextFunction } from 'express';
import { Space, User, SpaceResource, Resource } from '../models'; // Import Space and User models
import { CustomError } from '../middlewares/errorHandler';

// Extend Request to include user property from auth middlewares
interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

// Create a new Space (Admin or Manager)
export const createSpace = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, type, capacity, description, manager_id, isAvailable } =
      req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!name || !type || capacity === undefined || capacity < 0) {
      throw new CustomError('Name, type, and capacity are required.', 400);
    }

    // Determine the manager_id: if admin, use provided; if manager, use their own ID
    let finalManagerId = manager_id;
    if (userRole === 'manager') {
      finalManagerId = userId; // A manager can only create spaces they manage
    } else if (userRole !== 'admin' && manager_id) {
      throw new CustomError(
        'Forbidden: Only managers and admins can specify a manager_id.',
        403,
      );
    }

    // Optional: Validate if manager_id exists if provided
    if (finalManagerId) {
      const managerExists = await User.findByPk(finalManagerId);
      if (!managerExists) {
        throw new CustomError('Specified manager ID does not exist.', 400);
      }
      // Optional: Ensure the specified manager is actually a 'manager' role
      if (managerExists.role !== 'manager' && managerExists.role !== 'admin') {
        throw new CustomError(
          'A regular user cannot be assigned as a space manager.',
          400,
        );
      }
    }

    const newSpace = await Space.create({
      name,
      type,
      capacity,
      description,
      manager_id: finalManagerId,
      isAvailable: isAvailable !== undefined ? isAvailable : false, // Default to false if not provided
    });

    res
      .status(201)
      .json({ message: 'Space created successfully', space: newSpace });
  } catch (error) {
    next(error);
  }
};

// Get all Spaces (All authenticated users)
export const getAllSpaces = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const spaces = await Space.findAll({
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

// Get Space by ID (All authenticated users)
export const getSpaceById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
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

// Update a Space (Admin or the space's manager)
export const updateSpace = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { name, type, capacity, description, manager_id, isAvailable } =
      req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const space = await Space.findByPk(id);

    if (!space) {
      throw new CustomError('Space not found.', 404);
    }

    // Authorization: Only admin or the assigned manager can update the space
    if (userRole !== 'admin' && space.manager_id !== userId) {
      throw new CustomError(
        'Forbidden: You are not authorized to update this space.',
        403,
      );
    }

    // If manager_id is being changed, only admin can do it
    if (
      manager_id !== undefined &&
      manager_id !== space.manager_id &&
      userRole !== 'admin'
    ) {
      throw new CustomError(
        'Forbidden: Only an admin can reassign a space manager.',
        403,
      );
    }
    // If manager_id is being changed, validate if new manager exists and is correct role
    if (manager_id !== undefined && manager_id !== space.manager_id) {
      const newManager = await User.findByPk(manager_id);
      if (!newManager) {
        throw new CustomError('Specified new manager ID does not exist.', 400);
      }
      if (newManager.role !== 'manager' && newManager.role !== 'admin') {
        // Admins can also manage spaces
        throw new CustomError(
          'A regular user cannot be assigned as a space manager.',
          400,
        );
      }
      space.manager_id = manager_id;
    }

    space.name = name || space.name;
    space.type = type || space.type;
    space.capacity = capacity !== undefined ? capacity : space.capacity;
    space.description = description || space.description;
    space.isAvailable =
      isAvailable !== undefined ? isAvailable : space.isAvailable;

    await space.save();

    res.status(200).json({ message: 'Space updated successfully', space });
  } catch (error) {
    next(error);
  }
};

// Delete a Space (Admin or the space's manager)
export const deleteSpace = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const space = await Space.findByPk(id);

    if (!space) {
      throw new CustomError('Space not found.', 404);
    }

    // Authorization: Only admin or the assigned manager can delete the space
    if (userRole !== 'admin' && space.manager_id !== userId) {
      throw new CustomError(
        'Forbidden: You are not authorized to delete this space.',
        403,
      );
    }

    await space.destroy();

    res.status(204).send(); // No content to send back
  } catch (error) {
    next(error);
  }
};
