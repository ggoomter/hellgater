import { Router } from 'express';
import authRoutes from './auth.routes.js';
import characterRoutes from './character.routes.js';
import workoutRoutes from './workout.routes.js';
import levelTestRoutes from './levelTest.routes.js';
import exerciseRoutes from './exercise.routes.js';

const router = Router();

// API v1 라우트
router.use('/auth', authRoutes);
router.use('/characters', characterRoutes);
router.use('/workouts', workoutRoutes);
router.use('/level-tests', levelTestRoutes);
router.use('/exercises', exerciseRoutes);

export default router;
