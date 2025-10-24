import { Router } from 'express';
import {
  createCharacter,
  getMyCharacter,
  updateMyCharacter,
  createCharacterSchema,
} from '../controllers/character.controller.js';
import { validate } from '../middleware/validation.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// 모든 캐릭터 엔드포인트는 인증 필요
router.use(authenticate);

// POST /api/v1/characters - 캐릭터 생성
router.post('/', validate(createCharacterSchema), createCharacter);

// GET /api/v1/characters/me - 내 캐릭터 조회
router.get('/me', getMyCharacter);

// PATCH /api/v1/characters/me - 내 캐릭터 수정
router.patch('/me', updateMyCharacter);

export default router;
