import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  createWorkoutRecord,
  getWorkoutRecords,
  createWorkoutRecordSchema,
  getWorkoutRecordsSchema,
} from '../controllers/workout.controller.js';

const router = Router();

/**
 * 모든 운동 기록 API는 인증 필요
 */
router.use(authenticate);

/**
 * POST /api/v1/workouts
 * 운동 기록 생성
 */
router.post('/', validate(createWorkoutRecordSchema), createWorkoutRecord);

/**
 * GET /api/v1/workouts
 * 운동 기록 조회
 */
router.get('/', validate(getWorkoutRecordsSchema), getWorkoutRecords);

export default router;
