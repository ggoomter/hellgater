import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  startLevelTest,
  submitLevelTest,
  getAvailableLevelTests,
  getLevelTests,
  getLevelTest,
  startLevelTestSchema,
  submitLevelTestSchema,
} from '../controllers/levelTest.controller.js';

const router = Router();

/**
 * 모든 레벨테스트 API는 인증 필요
 */
router.use(authenticate);

/**
 * GET /api/v1/level-tests/available
 * 레벨테스트 가능 여부 조회
 */
router.get('/available', getAvailableLevelTests);

/**
 * POST /api/v1/level-tests/start
 * 레벨테스트 시작
 */
router.post('/start', validate(startLevelTestSchema), startLevelTest);

/**
 * GET /api/v1/level-tests
 * 레벨테스트 기록 조회
 */
router.get('/', getLevelTests);

/**
 * GET /api/v1/level-tests/:id
 * 특정 레벨테스트 조회
 */
router.get('/:id', getLevelTest);

/**
 * POST /api/v1/level-tests/:id/submit
 * 레벨테스트 제출
 */
router.post('/:id/submit', validate(submitLevelTestSchema), submitLevelTest);

export default router;
