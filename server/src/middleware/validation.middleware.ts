import type { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';
import { ValidationError } from './errorHandler.js';

/**
 * Zod 스키마를 사용한 요청 유효성 검증 미들웨어
 */
export function validate(schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Body 검증
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }

      // Query 검증
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }

      // Params 검증
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        next(new ValidationError('입력값이 올바르지 않습니다', errors));
      } else {
        next(error);
      }
    }
  };
}

// Common validation schemas
export const commonSchemas = {
  // UUID 검증
  uuid: z.string().uuid('유효한 UUID가 아닙니다'),

  // 이메일 검증
  email: z
    .string()
    .email('유효한 이메일 주소가 아닙니다')
    .max(255, '이메일은 최대 255자까지 가능합니다'),

  // 비밀번호 검증
  password: z
    .string()
    .min(4, '비밀번호는 최소 4자 이상이어야 합니다')
    .max(100, '비밀번호는 최대 100자까지 가능합니다'),

  // 사용자명 검증
  username: z
    .string()
    .min(2, '사용자명은 최소 2자 이상이어야 합니다')
    .max(50, '사용자명은 최대 50자까지 가능합니다')
    .regex(/^[a-zA-Z0-9_가-힣]+$/, '사용자명은 영문, 숫자, 한글, 언더스코어만 가능합니다'),

  // 날짜 검증
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)'),

  // 페이지네이션
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
};
