import { Request, Response, NextFunction } from "express";
import { Resource } from "../models";
import { CustomError } from "../middlewares/errorHandler";

// Extend Request to include user property from auth middlewares
interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

// Create a new Resource (Admin only)
export const createResource = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, description, available_quantity } = req.body;

    if (!name || !available_quantity) {
      throw new CustomError("Name and available quantity are required.", 400);
    }

    const newResource = await Resource.create({
      name,
      description,
      available_quantity,
    });

    res.status(201).json({
      message: "Resource created successfully",
      resource: newResource,
    });
  } catch (error) {
    next(error);
  }
};

// Get all Resources (All authenticated users)
export const getAllResources = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const resources = await Resource.findAll();
    res.status(200).json(resources);
  } catch (error) {
    next(error);
  }
};

// Get Resource by ID (All authenticated users)
export const getResourceById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findByPk(id);

    if (!resource) {
      throw new CustomError("Resource not found.", 404);
    }

    res.status(200).json(resource);
  } catch (error) {
    next(error);
  }
};

// Update a Resource (Admin only)
export const updateResource = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { name, description, available_quantity } = req.body;

    const resource = await Resource.findByPk(id);

    if (!resource) {
      throw new CustomError("Resource not found.", 404);
    }

    resource.name = name || resource.name;
    resource.description = description || resource.description;
    resource.available_quantity =
      available_quantity !== undefined
        ? available_quantity
        : resource.available_quantity;

    await resource.save();

    res
      .status(200)
      .json({ message: "Resource updated successfully", resource });
  } catch (error) {
    next(error);
  }
};

// Delete a Resource (Admin only)
export const deleteResource = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findByPk(id);

    if (!resource) {
      throw new CustomError("Resource not found.", 404);
    }

    await resource.destroy();

    res.status(204).send(); // No content to send back
  } catch (error) {
    next(error);
  }
};
