import { Request, Response, NextFunction } from 'express';
import { SpaceResource, Space, Resource } from '../models';
import { CustomError } from '../middlewares/errorHandler';
import { Op } from 'sequelize';

interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

export const addOrUpdateSpaceResource = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { spaceId, resourceId, quantity } = req.body;

    if (!spaceId || !resourceId || quantity === undefined || quantity < 0) {
      throw new CustomError(
        'Space ID, Resource ID, and a valid quantity are required.',
        400,
      );
    }

    const space = await Space.findByPk(spaceId);
    if (!space) {
      throw new CustomError('Space not found.', 404);
    }

    const resource = await Resource.findByPk(resourceId);
    if (!resource) {
      throw new CustomError('Resource not found.', 404);
    }

    if (req.user?.role !== 'admin' && req.user?.id !== space.managerId) {
      throw new CustomError(
        'Forbidden: You are not authorized to manage this space.',
        403,
      );
    }

    let spaceResource = await SpaceResource.findOne({
      where: { spaceId, resourceId },
    });

    if (spaceResource) {
      spaceResource.quantity = quantity;
      await spaceResource.save();
      res.status(200).json({
        message: 'Space resource quantity updated successfully',
        spaceResource,
      });
    } else {
      spaceResource = await SpaceResource.create({
        spaceId,
        resourceId,
        quantity,
      });
      res.status(201).json({
        message: 'Resource added to space successfully',
        spaceResource,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getResourcesForSpace = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { spaceId } = req.params;

    const space = await Space.findByPk(spaceId);
    if (!space) {
      throw new CustomError('Space not found.', 404);
    }

    const spaceResources = await SpaceResource.findAll({
      where: { spaceId: spaceId },
      include: [{ model: Resource, as: 'resource' }],
    });

    res.status(200).json(spaceResources);
  } catch (error) {
    next(error);
  }
};

export const removeResourceFromSpace = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { spaceId, resourceId } = req.params;

    const space = await Space.findByPk(spaceId);
    if (!space) {
      throw new CustomError('Space not found.', 404);
    }

    if (req.user?.role !== 'admin' && req.user?.id !== space.managerId) {
      throw new CustomError(
        'Forbidden: You are not authorized to manage this space.',
        403,
      );
    }

    const result = await SpaceResource.destroy({
      where: { spaceId: spaceId, resourceId: resourceId },
    });

    if (result === 0) {
      throw new CustomError('Space-resource association not found.', 404);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
