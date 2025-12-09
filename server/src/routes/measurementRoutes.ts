import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import * as measurementController from '../controllers/measurementController';

const router = Router();

// 모든 라우트에 인증 필요
router.use(authenticate);

// 신체 측정 기록 조회
router.get('/measurements', measurementController.getMeasurements);

// 최근 측정 기록 조회
router.get('/measurements/latest', measurementController.getLatestMeasurement);

// 신체 측정 기록 생성
router.post('/measurements', measurementController.createMeasurement);

// 진행 사진 조회
router.get('/photos', measurementController.getProgressPhotos);

// 진행 사진 업로드
router.post('/photos', measurementController.uploadProgressPhoto);

// 목표 조회
router.get('/goals', measurementController.getGoals);

// 활성 목표 조회
router.get('/goals/active', measurementController.getActiveGoal);

// 목표 생성
router.post('/goals', measurementController.createGoal);

// 목표 업데이트
router.put('/goals/:goalId', measurementController.updateGoal);

// 목표 완료 처리
router.post('/goals/:goalId/complete', measurementController.completeGoal);

export default router;
