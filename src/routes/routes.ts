import { Router } from 'express';
import { authRoutes } from './authRoutes';
import { userRoutes } from './userRoutes';
import { spaceRoutes } from './spaceRoutes';
import { resourceRoutes } from './resourceRoutes';
import { spaceResourceRoutes } from './spaceResourceRoutes';
import { reservationRoutes } from './reservationRoutes';

export const router = Router();

router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api/spaces', spaceRoutes);
router.use('/api/resources', resourceRoutes);
router.use('/api/space-resources', spaceResourceRoutes);
router.use('/api/reservations', reservationRoutes);
