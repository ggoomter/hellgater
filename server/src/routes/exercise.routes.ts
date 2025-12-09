import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import * as exerciseController from '../controllers/exercise.controller.js';
import { getProgressiveOverloadRecommendation } from '../controllers/progressiveOverload.controller.js';
import { validate } from '../middleware/validation.middleware.js';
import { getProgressiveOverloadRecommendationSchema } from '../controllers/progressiveOverload.controller.js';

const router = Router();

/**
 * GET /api/v1/exercises/body-parts
 * 모든 운동 부위 목록 조회
 */
router.get('/body-parts', authenticate, exerciseController.getBodyParts);

/**
 * GET /api/v1/exercises/by-body-part/:bodyPartId
 * 특정 부위의 운동 목록 조회
 */
router.get('/by-body-part/:bodyPartId', authenticate, exerciseController.getExercisesByBodyPart);

/**
 * GET /api/v1/exercises/:exerciseId/progressive-overload
 * 프로그레시브 오버로드 추천 조회
 */
router.get(
  '/:exerciseId/progressive-overload',
  authenticate,
  validate(getProgressiveOverloadRecommendationSchema),
  getProgressiveOverloadRecommendation
);

/**
 * GET /api/v1/exercises/:exerciseId
 * 특정 운동의 상세 정보 조회
 */
router.get('/:exerciseId', authenticate, exerciseController.getExerciseDetail);

export default router;
