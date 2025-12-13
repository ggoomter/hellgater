import { Router } from 'express';
import * as skillController from '../controllers/skillController.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// 모든 라우트에 인증 적용
router.use(authenticate);

router.get('/', skillController.getAllSkills);
router.get('/:id', skillController.getSkillDetail);

export default router;
