import { Router } from 'express';
import {
  register,
  login,
  refreshAccessToken,
  logout,
  getMe,
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from '../controllers/auth.controller.js';
import { validate } from '../middleware/validation.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// POST /api/v1/auth/register - 회원가입
router.post('/register', validate(registerSchema), register);

// POST /api/v1/auth/login - 로그인
router.post('/login', validate(loginSchema), login);

// POST /api/v1/auth/refresh - 토큰 갱신
router.post('/refresh', validate(refreshTokenSchema), refreshAccessToken);

// POST /api/v1/auth/logout - 로그아웃 (인증 필요)
router.post('/logout', authenticate, logout);

// GET /api/v1/auth/me - 현재 사용자 정보 (인증 필요)
router.get('/me', authenticate, getMe);

export default router;
