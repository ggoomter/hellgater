import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { HttpError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import { progressiveOverloadService } from '../services/gameEngine/progressiveOverloadService.js';

// Validation schemas

export const getProgressiveOverloadRecommendationSchema = z.object({
  params: z.object({
    exerciseId: z.string().regex(/^\d+$/).transform(Number),
  }),
});

/**
 * GET /api/v1/exercises/:exerciseId/progressive-overload
 * 프로그레시브 오버로드 추천 조회
 */
export async function getProgressiveOverloadRecommendation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const { exerciseId } = req.params;

    logger.info(`Getting progressive overload recommendation for user ${userId}, exercise ${exerciseId}`);

    const recommendation = await progressiveOverloadService.getNextWorkoutRecommendation(
      userId,
      Number(exerciseId)
    );

    if (!recommendation) {
      return res.json({
        message: '최근 운동 기록이 없어 추천을 제공할 수 없습니다.',
        recommendation: null,
      });
    }

    res.json({
      recommendation: {
        current: {
          weight: recommendation.currentWorkout.weight,
          reps: recommendation.currentWorkout.reps,
          sets: recommendation.currentWorkout.sets,
          rpe: recommendation.currentWorkout.rpe,
        },
        next: {
          weight: recommendation.recommendation.nextWeight,
          reps: recommendation.recommendation.nextReps,
          sets: recommendation.recommendation.nextSets,
          expectedRPE: recommendation.expectedRPE,
        },
        reason: recommendation.recommendation.reason,
        progressionType: recommendation.recommendation.progressionType,
        researchBasis: recommendation.recommendation.researchBasis,
        warnings: recommendation.warnings,
      },
    });
  } catch (error) {
    next(error);
  }
}

