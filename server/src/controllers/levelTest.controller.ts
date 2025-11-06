import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { HttpError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import { levelTestService } from '../services/gameEngine/levelTestService.js';

// Validation schemas

export const startLevelTestSchema = z.object({
  body: z.object({
    bodyPartId: z.number().int().min(1).max(7, '신체 부위 ID는 1-7 사이여야 합니다'),
  }),
});

export const submitLevelTestSchema = z.object({
  body: z.object({
    workoutRecordId: z.string().uuid('유효한 운동 기록 ID가 아닙니다'),
    videoUrl: z.string().url('유효한 URL이 아닙니다').optional(),
  }),
});

/**
 * POST /api/v1/level-tests/start
 * 레벨테스트 시작
 */
export async function startLevelTest(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { bodyPartId } = req.body;

    logger.info(`Starting level test for user ${userId}, bodyPartId ${bodyPartId}`);

    const result = await levelTestService.startLevelTest(userId, bodyPartId);

    logger.info(`Level test started: ID=${result.levelTest.id}, Target Level=${result.levelTest.targetLevel}`);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/level-tests/:id/submit
 * 레벨테스트 제출
 */
export async function submitLevelTest(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const levelTestId = req.params.id;
    const { workoutRecordId, videoUrl } = req.body;

    logger.info(`Submitting level test ${levelTestId} for user ${userId}`);

    const result = await levelTestService.submitLevelTest(
      userId,
      levelTestId,
      workoutRecordId,
      videoUrl
    );

    logger.info(`Level test submitted: Status=${result.levelTest.status}, LeveledUp=${result.leveledUp}`);

    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/level-tests/available
 * 레벨테스트 가능 여부 조회
 */
export async function getAvailableLevelTests(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;

    logger.info(`Getting available level tests for user ${userId}`);

    // 레벨테스트 가능한 부위 조회
    const availableBodyParts = await prisma.userBodyPart.findMany({
      where: {
        userId,
        canTakeLevelTest: true,
      },
      include: {
        bodyPart: true,
      },
    });

    res.json({
      available: availableBodyParts.map((ubp) => ({
        bodyPartId: ubp.bodyPartId,
        bodyPartName: ubp.bodyPart.nameKo,
        currentLevel: ubp.level,
        targetLevel: ubp.targetLevelForTest,
        currentExp: ubp.currentExp,
        requiredExp: levelTestService.getRequiredExpForLevel(ubp.level + 1),
      })),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/level-tests
 * 레벨테스트 기록 조회
 */
export async function getLevelTests(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { status, bodyPartId } = req.query;

    logger.info(`Getting level tests for user ${userId}`);

    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    if (bodyPartId) {
      where.bodyPartId = Number(bodyPartId);
    }

    const levelTests = await prisma.levelTest.findMany({
      where,
      include: {
        userBodyPart: {
          include: {
            bodyPart: true,
          },
        },
        workoutRecord: {
          include: {
            exercise: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      levelTests: levelTests.map((lt) => ({
        id: lt.id,
        bodyPartId: lt.bodyPartId,
        bodyPartName: lt.userBodyPart.bodyPart.nameKo,
        currentLevel: lt.currentLevel,
        targetLevel: lt.targetLevel,
        conditions: lt.conditions,
        status: lt.status,
        workoutRecord: lt.workoutRecord
          ? {
              id: lt.workoutRecord.id,
              exerciseName: lt.workoutRecord.exercise.nameKo,
              sets: lt.workoutRecord.sets,
              reps: lt.workoutRecord.reps,
              weight: Number(lt.workoutRecord.weight),
            }
          : undefined,
        videoUrl: lt.videoUrl,
        submittedAt: lt.submittedAt?.toISOString(),
        reviewedAt: lt.reviewedAt?.toISOString(),
        reviewComment: lt.reviewComment,
        createdAt: lt.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/level-tests/:id
 * 특정 레벨테스트 조회
 */
export async function getLevelTest(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const levelTestId = req.params.id;

    logger.info(`Getting level test ${levelTestId} for user ${userId}`);

    const levelTest = await prisma.levelTest.findUnique({
      where: { id: levelTestId },
      include: {
        userBodyPart: {
          include: {
            bodyPart: true,
          },
        },
        workoutRecord: {
          include: {
            exercise: true,
          },
        },
      },
    });

    if (!levelTest) {
      throw new HttpError(404, '레벨테스트를 찾을 수 없습니다');
    }

    if (levelTest.userId !== userId) {
      throw new HttpError(403, '권한이 없습니다');
    }

    res.json({
      id: levelTest.id,
      bodyPartId: levelTest.bodyPartId,
      bodyPartName: levelTest.userBodyPart.bodyPart.nameKo,
      currentLevel: levelTest.currentLevel,
      targetLevel: levelTest.targetLevel,
      conditions: levelTest.conditions,
      status: levelTest.status,
      workoutRecord: levelTest.workoutRecord
        ? {
            id: levelTest.workoutRecord.id,
            exerciseName: levelTest.workoutRecord.exercise.nameKo,
            sets: levelTest.workoutRecord.sets,
            reps: levelTest.workoutRecord.reps,
            weight: Number(levelTest.workoutRecord.weight),
            calculated1RM: levelTest.workoutRecord.calculated1RM
              ? Number(levelTest.workoutRecord.calculated1RM)
              : undefined,
            grade: levelTest.workoutRecord.grade || undefined,
          }
        : undefined,
      videoUrl: levelTest.videoUrl,
      submittedAt: levelTest.submittedAt?.toISOString(),
      reviewedAt: levelTest.reviewedAt?.toISOString(),
      reviewComment: levelTest.reviewComment,
      createdAt: levelTest.createdAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
}
