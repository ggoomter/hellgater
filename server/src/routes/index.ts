import { Router } from 'express';
import authRoutes from './auth.routes.js';
import characterRoutes from './character.routes.js';

const router = Router();

// API v1 라우트
router.use('/auth', authRoutes);
router.use('/characters', characterRoutes);

export default router;
