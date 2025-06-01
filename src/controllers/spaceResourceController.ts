import { Request, Response, NextFunction } from "express";
import { SpaceResource, Space, Resource } from "../models";
import { CustomError } from "../middlewares/errorHandler";
import { Op } from "sequelize"; // Import Op for Sequelize operators

// Extend Request to include user property from auth middlewares
interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

// Add a resource to a space or update its quantity if it exists (Manager/Admin)
export const addOrUpdateSpaceResource = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { spaceId, resourceId, quantity } = req.body;

    if (!spaceId || !resourceId || quantity === undefined || quantity < 0) {
      throw new CustomError(
        "Space ID, Resource ID, and a valid quantity are required.",
        400,
      );
    }

    const space = await Space.findByPk(spaceId);
    if (!space) {
      throw new CustomError("Space not found.", 404);
    }

    const resource = await Resource.findByPk(resourceId);
    if (!resource) {
      throw new CustomError("Resource not found.", 404);
    }

    // Check if the authenticated user is the manager of the space or an admin
    if (req.user?.role !== "admin" && req.user?.id !== space.manager_id) {
      throw new CustomError(
        "Forbidden: You are not authorized to manage this space.",
        403,
      );
    }

    let spaceResource = await SpaceResource.findOne({
      where: { space_id: spaceId, resource_id: resourceId },
    });

    if (spaceResource) {
      // Update existing
      spaceResource.quantity = quantity;
      await spaceResource.save();
      res.status(200).json({
        message: "Space resource quantity updated successfully",
        spaceResource,
      });
    } else {
      // Create new
      spaceResource = await SpaceResource.create({
        space_id: spaceId,
        resource_id: resourceId,
        quantity,
      });
      res.status(201).json({
        message: "Resource added to space successfully",
        spaceResource,
      });
    }
  } catch (error) {
    next(error);
  }
};

// Get all resources for a specific space (All authenticated users)
export const getResourcesForSpace = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { spaceId } = req.params;

    const space = await Space.findByPk(spaceId);
    if (!space) {
      throw new CustomError("Space not found.", 404);
    }

    const spaceResources = await SpaceResource.findAll({
      where: { space_id: spaceId },
      include: [{ model: Resource, as: "resource" }], // Include resource details
    });

    res.status(200).json(spaceResources);
  } catch (error) {
    next(error);
  }
};

// Remove a resource from a space (Manager/Admin)
export const removeResourceFromSpace = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { spaceId, resourceId } = req.params; // Expecting spaceId and resourceId in params

    const space = await Space.findByPk(spaceId);
    if (!space) {
      throw new CustomError("Space not found.", 404);
    }

    // Check if the authenticated user is the manager of the space or an admin
    if (req.user?.role !== "admin" && req.user?.id !== space.manager_id) {
      throw new CustomError(
        "Forbidden: You are not authorized to manage this space.",
        403,
      );
    }

    const result = await SpaceResource.destroy({
      where: { space_id: spaceId, resource_id: resourceId },
    });

    if (result === 0) {
      throw new CustomError("Space-resource association not found.", 404);
    }

    res.status(204).send(); // No content
  } catch (error) {
    next(error);
  }
};
