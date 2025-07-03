import { Request, Response, NextFunction } from 'express';
import { Resource } from '../models';
import { CustomError } from '../middlewares/errorHandler';

interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

export const createResource = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, availableQuantity } = req.body;

    if (!name || !availableQuantity) {
      throw new CustomError('Name and available quantity are required.', 400);
    }

    const newResource = await Resource.create({
      name,
      description,
      availableQuantity,
    });

    res.status(201).json({
      message: 'Resource created successfully',
      resource: newResource,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllResources = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const resources = await Resource.findAll();
    res.status(200).json(resources);
  } catch (error) {
    next(error);
  }
};

export const getResourceById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findByPk(id);

    if (!resource) {
      throw new CustomError('Resource not found.', 404);
    }

    res.status(200).json(resource);
  } catch (error) {
    next(error);
  }
};

export const updateResource = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description, availableQuantity } = req.body;

    const resource = await Resource.findByPk(id);

    if (!resource) {
      throw new CustomError('Resource not found.', 404);
    }

    resource.name = name || resource.name;
    resource.description = description || resource.description;
    resource.availableQuantity = availableQuantity !== undefined ? availableQuantity : resource.availableQuantity;

    await resource.save();

    res.status(200).json({ message: 'Resource updated successfully', resource });
  } catch (error) {
    next(error);
  }
};

export const deleteResource = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findByPk(id);

    if (!resource) {
      throw new CustomError('Resource not found.', 404);
    }

    await resource.destroy();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
