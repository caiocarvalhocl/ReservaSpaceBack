import { Router } from "express";
import {
  authenticateToken,
  authorizeRole,
} from "../middlewares/authMiddleware";
import {
  addOrUpdateSpaceResource,
  getResourcesForSpace,
  removeResourceFromSpace,
} from "../controllers/spaceResourceController";

export const spaceResourceRoutes = Router();

// Routes for Space-Resource association
spaceResourceRoutes.post(
  "/",
  authenticateToken,
  authorizeRole(["admin", "manager"]),
  addOrUpdateSpaceResource,
); // Add or update quantity
spaceResourceRoutes.get("/:spaceId", authenticateToken, getResourcesForSpace); // Get resources for a specific space
spaceResourceRoutes.delete(
  "/:spaceId/:resourceId",
  authenticateToken,
  authorizeRole(["admin", "manager"]),
  removeResourceFromSpace,
); // Remove specific resource from space
