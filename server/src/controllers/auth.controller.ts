import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateTokenPair, verifyRefreshToken, hashRefreshToken } from '../utils/jwt.js';
import { HttpError, ValidationError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

// Validation schemas
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('유효한 이메일 주소가 아닙니다'),
    password: z
      .string()
      .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
      .regex(/[a-z]/, '비밀번호는 소문자를 포함해야 합니다')
      .regex(/[A-Z]/, '비밀번호는 대문자를 포함해야 합니다')
      .regex(/[0-9]/, '비밀번호는 숫자를 포함해야 합니다'),
    username: z
      .string()
      .min(2, '사용자명은 최소 2자 이상이어야 합니다')
      .max(50, '사용자명은 최대 50자까지 가능합니다'),
    gender: z.enum(['male', 'female', 'other']).optional(),
    birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    height: z.number().min(0).max(300).optional(),
    weight: z.number().min(0).max(500).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('유효한 이메일 주소가 아닙니다'),
    password: z.string().min(1, '비밀번호를 입력해주세요'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, '리프레시 토큰을 입력해주세요'),
  }),
});

/**
 * POST /api/v1/auth/register
 * 회원가입
 */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, username, gender, birthdate, height, weight } = req.body;

    // 이메일 중복 체크
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      throw new HttpError(409, '이미 사용 중인 이메일입니다', 'EMAIL_ALREADY_EXISTS');
    }

    // 사용자명 중복 체크
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUserByUsername) {
      throw new HttpError(409, '이미 사용 중인 사용자명입니다', 'USERNAME_ALREADY_EXISTS');
    }

    // 비밀번호 해싱
    const passwordHash = await hashPassword(password);

    // 트랜잭션으로 사용자 생성 + RefreshToken 저장
    const result = await prisma.$transaction(async (tx) => {
      // 사용자 생성
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          username,
          gender,
          birthdate: birthdate ? new Date(birthdate) : null,
          height,
          weight,
        },
        select: {
          id: true,
          email: true,
          username: true,
          profileImageUrl: true,
          subscriptionTier: true,
          createdAt: true,
        },
      });

      // 토큰 생성
      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
      });

      // Refresh Token DB 저장
      await tx.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: hashRefreshToken(tokens.refreshToken),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일
          ipAddress: req.ip,
          deviceType: req.headers['user-agent'] || 'unknown',
        },
      });

      return { user, tokens };
    });

    const { user, tokens } = result;

    logger.info(`New user registered: ${user.email}`);

    res.status(201).json({
      success: true,
      data: {
        user,
        tokens,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/login
 * 로그인
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        passwordHash: true,
        profileImageUrl: true,
        subscriptionTier: true,
        deletedAt: true,
      },
    });

    if (!user || user.deletedAt) {
      throw new HttpError(401, '이메일 또는 비밀번호가 올바르지 않습니다', 'INVALID_CREDENTIALS');
    }

    // 비밀번호 검증
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new HttpError(401, '이메일 또는 비밀번호가 올바르지 않습니다', 'INVALID_CREDENTIALS');
    }

    // 토큰 생성
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
    });

    // Refresh Token DB 저장
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashRefreshToken(tokens.refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일
        ipAddress: req.ip,
        deviceType: req.headers['user-agent'] || 'unknown',
      },
    });

    // 마지막 로그인 시간 업데이트
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    logger.info(`User logged in: ${user.email}`);

    const { passwordHash, deletedAt, ...userResponse } = user;

    res.json({
      success: true,
      data: {
        user: userResponse,
        tokens,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/refresh
 * 토큰 갱신
 */
export async function refreshAccessToken(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;

    // Refresh Token 검증
    const payload = verifyRefreshToken(refreshToken);

    // DB에서 Refresh Token 확인
    const tokenHash = hashRefreshToken(refreshToken);
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        userId: payload.userId,
        tokenHash,
        expiresAt: { gte: new Date() },
      },
    });

    if (!storedToken) {
      throw new HttpError(401, '유효하지 않거나 만료된 리프레시 토큰입니다', 'INVALID_REFRESH_TOKEN');
    }

    // 새 Access Token 생성
    const tokens = generateTokenPair({
      userId: payload.userId,
      email: payload.email,
    });

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/logout
 * 로그아웃
 */
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw new HttpError(401, '인증이 필요합니다', 'UNAUTHORIZED');
    }

    // DB에서 해당 사용자의 모든 Refresh Token 삭제
    await prisma.refreshToken.deleteMany({
      where: { userId: req.user.userId },
    });

    logger.info(`User logged out: ${req.user.email}`);

    res.json({
      success: true,
      message: '로그아웃되었습니다',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/auth/me
 * 현재 로그인한 사용자 정보 조회
 */
export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw new HttpError(401, '인증이 필요합니다', 'UNAUTHORIZED');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        username: true,
        profileImageUrl: true,
        bio: true,
        gender: true,
        birthdate: true,
        height: true,
        weight: true,
        subscriptionTier: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new HttpError(404, '사용자를 찾을 수 없습니다', 'USER_NOT_FOUND');
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}
