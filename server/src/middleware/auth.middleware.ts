import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { UnauthorizedError } from './errorHandler.js';

/**
 * JWT 인증 미들웨어
 * Authorization: Bearer <token> 형태의 헤더에서 토큰 추출 및 검증
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    // Authorization 헤더 확인
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('인증 토큰이 필요합니다');
    }

    // Bearer 토큰 추출
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedError('잘못된 토큰 형식입니다');
    }

    const token = parts[1];

    // 토큰 검증
    const payload = verifyAccessToken(token);

    // Request 객체에 사용자 정보 추가
    req.user = payload;

    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        next(new UnauthorizedError('토큰이 만료되었습니다'));
      } else if (error.message.includes('invalid')) {
        next(new UnauthorizedError('유효하지 않은 토큰입니다'));
      } else {
        next(error);
      }
    } else {
      next(new UnauthorizedError('인증에 실패했습니다'));
    }
  }
}

/**
 * 선택적 인증 미들웨어
 * 토큰이 있으면 검증하지만, 없어도 다음 미들웨어로 진행
 */
export function optionalAuthenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const parts = authHeader.split(' ');

    if (parts.length === 2 && parts[0] === 'Bearer') {
      const token = parts[1];
      const payload = verifyAccessToken(token);
      req.user = payload;
    }

    next();
  } catch (error) {
    // 토큰이 유효하지 않아도 계속 진행
    next();
  }
}
