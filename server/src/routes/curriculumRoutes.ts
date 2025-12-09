import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import * as curriculumController from '../controllers/curriculumController';

const router = Router();

// 모든 주차 목록 조회
router.get('/weeks', curriculumController.getAllWeeks);

// 특정 주차 상세 조회
router.get('/weeks/:weekNumber', curriculumController.getWeekByNumber);

// 특정 주차의 콘텐츠 모듈 조회
router.get('/weeks/:weekNumber/modules', curriculumController.getWeekModules);

// 사용자별 커리큘럼 진행 상황 조회 (인증 필요)
router.get('/progress', authenticateToken, curriculumController.getUserProgress);

// 특정 주차 진행 상황 조회
router.get('/progress/:weekNumber', authenticateToken, curriculumController.getWeekProgress);

// 주차 시작 (언락)
router.post('/weeks/:weekNumber/start', authenticateToken, curriculumController.startWeek);

// 콘텐츠 모듈 완료 처리
router.post('/modules/:moduleId/complete', authenticateToken, curriculumController.completeModule);

// 퀴즈 제출
router.post('/modules/:moduleId/submit-quiz', authenticateToken, curriculumController.submitQuiz);

export default router;
