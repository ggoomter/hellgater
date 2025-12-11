import { Request, Response, NextFunction } from 'express';

/**
 * Express 비동기 함수 에러 핸들링을 위한 래퍼 함수
 * async 함수에서 발생하는 에러를 자동으로 catch하여 next()로 전달
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

