import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { HttpError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import { rmAnalysisService } from '../services/rmAnalysis/rmAnalysisService.js';
import { expCalculationService } from '../services/gameEngine/expCalculationService.js';
import { calorieCalculationService } from '../services/gameEngine/calorieCalculationService.js';
import { levelTestService } from '../services/gameEngine/levelTestService.js';
import { levelUpService } from '../services/gameEngine/levelUpService.js';

// Validation schemas

export const createWorkoutRecordSchema = z.object({
  body: z.object({
    exerciseId: z.number().int().positive('운동 ID는 양의 정수여야 합니다'),
    sets: z.number().int().min(1, '세트 수는 최소 1 이상이어야 합니다').max(50, '세트 수는 최대 50까지 가능합니다'),
    reps: z.number().int().min(1, '반복 횟수는 최소 1 이상이어야 합니다').max(500, '반복 횟수는 최대 500까지 가능합니다'),
    weight: z.number().min(0, '무게는 0 이상이어야 합니다').max(1000, '무게는 최대 1000kg까지 가능합니다'),
    videoUrl: z.string().url('유효한 URL이 아닙니다').optional(),
    notes: z.string().max(1000, '메모는 최대 1000자까지 가능합니다').optional(),
    workoutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)').optional(),
  }),
});

export const getWorkoutRecordsSchema = z.object({
  query: z.object({
    bodyPartId: z.string().regex(/^\d+$/).transform(Number).optional(),
    exerciseId: z.string().regex(/^\d+$/).transform(Number).optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    offset: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});

/**
 * POST /api/v1/workouts
 * 운동 기록 생성
 */
export async function createWorkoutRecord(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { exerciseId, sets, reps, weight, videoUrl, notes, workoutDate } = req.body;

    logger.info(`Creating workout record for user ${userId}: exercise ${exerciseId}`);

    // 1. 운동 종목 정보 조회
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
      include: { bodyPart: true },
    });

    if (!exercise) {
      throw new HttpError(404, '운동 종목을 찾을 수 없습니다');
    }

    // 2. 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { weight: true, gender: true, birthdate: true },
    });

    if (!user || !user.weight || !user.gender) {
      throw new HttpError(400, '사용자 정보가 불완전합니다. 체중과 성별을 입력해주세요.');
    }

    // 나이 계산
    let userAge: number | undefined;
    if (user.birthdate) {
      const today = new Date();
      const birthDate = new Date(user.birthdate);
      userAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        userAge--;
      }
    }

    // 3. UserBodyPart 조회 (현재 레벨)
    const userBodyPart = await prisma.userBodyPart.findUnique({
      where: {
        userId_bodyPartId: {
          userId,
          bodyPartId: exercise.bodyPartId,
        },
      },
    });

    if (!userBodyPart) {
      throw new HttpError(404, '신체 부위 정보를 찾을 수 없습니다');
    }

    // 4. 1RM 분석 (운동 코드 및 나이 포함)
    const rmAnalysis = await rmAnalysisService.analyze({
      userId,
      exerciseId,
      bodyPartId: exercise.bodyPartId,
      weight,
      reps,
      userWeight: Number(user.weight),
      userGender: user.gender.toUpperCase(),
      exerciseCode: exercise.code, // 운동 코드 전달 (더 정확한 계산을 위해)
      userAge, // 나이 전달 (연령 조정용)
    });

    logger.info(`RM Analysis: 1RM=${rmAnalysis.calculated1RM}kg, Grade=${rmAnalysis.grade}, PR=${rmAnalysis.isPersonalRecord}`);

    // 5. 경험치 계산
    const expResult = expCalculationService.calculate({
      sets,
      reps,
      weight,
      exerciseDifficulty: exercise.difficulty,
      grade: rmAnalysis.grade,
      isPersonalRecord: rmAnalysis.isPersonalRecord,
      currentBodyPartLevel: userBodyPart.level,
    });

    logger.info(`Exp Calculation: Total=${expResult.totalExp}, Breakdown=${JSON.stringify(expResult.breakdown)}`);

    // 6. 칼로리 계산 (개인화된 방법 사용)
    const calorieResult = calorieCalculationService.calculate({
      userWeight: Number(user.weight),
      userAge,
      userGender: user.gender.toUpperCase(),
      exerciseType: exercise.code,
      sets,
      reps,
      weight,
      exerciseIntensity: 5, // 기본값 (나중에 사용자 입력으로 받을 수 있음)
    });
    const caloriesBurned = calorieResult.totalCalories;

    // 7. 트랜잭션으로 데이터 저장 및 레벨업 체크
    const result = await prisma.$transaction(async (tx) => {
      // 7-1. WorkoutRecord 생성
      const workoutRecord = await tx.workoutRecord.create({
        data: {
          userId,
          exerciseId,
          bodyPartId: exercise.bodyPartId,
          sets,
          reps,
          weight,
          calculated1RM: rmAnalysis.calculated1RM,
          rmPercentage: rmAnalysis.rmPercentage,
          grade: rmAnalysis.grade,
          expGained: expResult.totalExp,
          caloriesBurned,
          videoUrl,
          notes,
          verified: false,
          workoutDate: workoutDate ? new Date(workoutDate) : new Date(),
        },
      });

      // 7-2. 현재 상태 조회 (레벨업 체크용)
      const currentBodyPart = await tx.userBodyPart.findUnique({
        where: {
          userId_bodyPartId: {
            userId,
            bodyPartId: exercise.bodyPartId,
          },
        },
      });

      if (!currentBodyPart) {
        throw new HttpError(404, '신체 부위 정보를 찾을 수 없습니다');
      }

      // 7-3. 경험치 추가 및 레벨업 체크
      const oldLevel = currentBodyPart.level;
      let currentExp = currentBodyPart.currentExp + expResult.totalExp;
      let newLevel = oldLevel;
      let levelsGained = 0;
      const rewards: { skillPoints?: number; titles?: string[] } = {};

      // 레벨업 체크 (여러 레벨 한번에 오를 수 있음)
      while (true) {
        const requiredExp = levelUpService.getRequiredExpForLevel(newLevel);
        
        if (currentExp >= requiredExp) {
          currentExp -= requiredExp;
          newLevel += 1;
          levelsGained += 1;

          // 레벨업 보상
          if (newLevel % 5 === 0) {
            rewards.skillPoints = (rewards.skillPoints || 0) + 1;
          }
          if (newLevel % 10 === 0) {
            if (!rewards.titles) {
              rewards.titles = [];
            }
            rewards.titles.push(`${newLevel}레벨 달성`);
          }
        } else {
          break;
        }
      }

      // 7-4. UserBodyPart 업데이트
      const updatedBodyPart = await tx.userBodyPart.update({
        where: {
          userId_bodyPartId: {
            userId,
            bodyPartId: exercise.bodyPartId,
          },
        },
        data: {
          level: newLevel,
          currentExp,
          lastWorkoutAt: new Date(),
          // max1RmWeight 업데이트 (PR인 경우)
          ...(rmAnalysis.isPersonalRecord && {
            max1RmWeight: rmAnalysis.calculated1RM,
          }),
        },
      });

      // 7-5. Character 전체 경험치 추가 및 레벨 업데이트
      const characterExpGain = Math.round(expResult.totalExp * 0.1);
      await tx.character.update({
        where: { userId },
        data: {
          totalExp: {
            increment: characterExpGain,
          },
        },
      });

      // 레벨업이 발생한 경우 전체 레벨 재계산
      if (levelsGained > 0) {
        const allBodyParts = await tx.userBodyPart.findMany({
          where: { userId },
          select: { level: true },
        });
        
        const totalLevel = Math.floor(
          allBodyParts.reduce((sum, bp) => sum + bp.level, 0) / allBodyParts.length
        );

        await tx.character.update({
          where: { userId },
          data: { totalLevel },
        });
      }

      return { 
        workoutRecord, 
        updatedBodyPart, 
        levelUp: levelsGained > 0 ? {
          didLevelUp: true,
          oldLevel,
          newLevel,
          levelsGained,
          rewards,
        } : null,
      };
    });

    logger.info(`Workout record created: ID=${result.workoutRecord.id}`);

    // 8. 레벨테스트 가능 여부 체크
    await levelTestService.checkAndUpdateLevelTestAvailability(
      userId,
      exercise.bodyPartId
    );

    // 9. 레벨테스트 가능 여부 조회
    const updatedUserBodyPart = await prisma.userBodyPart.findUnique({
      where: {
        userId_bodyPartId: {
          userId,
          bodyPartId: exercise.bodyPartId,
        },
      },
      include: {
        bodyPart: true,
      },
    });

    // 10. 응답 생성
    res.status(201).json({
      workout: {
        id: result.workoutRecord.id,
        exerciseId: result.workoutRecord.exerciseId,
        bodyPartId: result.workoutRecord.bodyPartId,
        sets: result.workoutRecord.sets,
        reps: result.workoutRecord.reps,
        weight: Number(result.workoutRecord.weight),
        calculated1RM: Number(result.workoutRecord.calculated1RM),
        rmPercentage: Number(result.workoutRecord.rmPercentage),
        grade: result.workoutRecord.grade!,
        expGained: result.workoutRecord.expGained!,
        caloriesBurned: Number(result.workoutRecord.caloriesBurned),
        videoUrl: result.workoutRecord.videoUrl,
        notes: result.workoutRecord.notes,
        verified: result.workoutRecord.verified,
        workoutDate: result.workoutRecord.workoutDate.toISOString().split('T')[0],
        createdAt: result.workoutRecord.createdAt.toISOString(),
      },
      expBreakdown: expResult.breakdown,
      levelUp: result.levelUp ? {
        didLevelUp: true,
        oldLevel: result.levelUp.oldLevel,
        newLevel: result.levelUp.newLevel,
        levelsGained: result.levelUp.levelsGained,
        bodyPartId: exercise.bodyPartId,
        bodyPartName: updatedUserBodyPart?.bodyPart.nameKo || '',
        rewards: result.levelUp.rewards,
      } : undefined,
      levelTestAvailable: updatedUserBodyPart?.canTakeLevelTest
        ? {
            bodyPartId: exercise.bodyPartId,
            bodyPartName: updatedUserBodyPart.bodyPart.nameKo,
            currentLevel: updatedUserBodyPart.level,
            targetLevel: updatedUserBodyPart.targetLevelForTest!,
            canStartTest: true,
          }
        : undefined,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/workouts
 * 운동 기록 조회
 */
export async function getWorkoutRecords(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { bodyPartId, exerciseId, startDate, endDate, limit = 20, offset = 0 } = req.query;

    logger.info(`Getting workout records for user ${userId}`);

    // Where 조건 구성
    const where: any = { userId };

    if (bodyPartId) {
      where.bodyPartId = Number(bodyPartId);
    }

    if (exerciseId) {
      where.exerciseId = Number(exerciseId);
    }

    if (startDate || endDate) {
      where.workoutDate = {};
      if (startDate) {
        where.workoutDate.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.workoutDate.lte = new Date(endDate as string);
      }
    }

    // 운동 기록 조회
    const [workouts, total] = await Promise.all([
      prisma.workoutRecord.findMany({
        where,
        include: {
          exercise: {
            include: {
              bodyPart: true,
            },
          },
        },
        orderBy: {
          workoutDate: 'desc',
        },
        take: Number(limit),
        skip: Number(offset),
      }),
      prisma.workoutRecord.count({ where }),
    ]);

    // 통계 계산
    const allWorkouts = await prisma.workoutRecord.findMany({
      where: { userId },
      select: {
        sets: true,
        reps: true,
        weight: true,
        caloriesBurned: true,
      },
    });

    const totalWorkouts = allWorkouts.length;
    const totalCalories = allWorkouts.reduce(
      (sum, w) => sum + Number(w.caloriesBurned || 0),
      0
    );
    const totalVolume = allWorkouts.reduce(
      (sum, w) => sum + w.sets * w.reps * Number(w.weight),
      0
    );

    // 최근 개인 기록 조회 (각 부위별 최고 1RM)
    const recentPRs = await prisma.$queryRaw<
      Array<{
        bodyPartId: number;
        bodyPartName: string;
        exerciseName: string;
        weight: number;
        reps: number;
        date: Date;
      }>
    >`
      SELECT DISTINCT ON (wr.body_part_id)
        wr.body_part_id as "bodyPartId",
        bp.name_ko as "bodyPartName",
        e.name_ko as "exerciseName",
        wr.weight::float as weight,
        wr.reps as reps,
        wr.workout_date as date
      FROM workout_records wr
      INNER JOIN exercises e ON wr.exercise_id = e.id
      INNER JOIN body_parts bp ON wr.body_part_id = bp.id
      WHERE wr.user_id = ${userId}
      ORDER BY wr.body_part_id, wr.calculated_1rm DESC, wr.workout_date DESC
      LIMIT 7
    `;

    res.json({
      workouts: workouts.map((w) => ({
        id: w.id,
        exerciseId: w.exerciseId,
        bodyPartId: w.bodyPartId,
        sets: w.sets,
        reps: w.reps,
        weight: Number(w.weight),
        calculated1RM: w.calculated1RM ? Number(w.calculated1RM) : undefined,
        rmPercentage: w.rmPercentage ? Number(w.rmPercentage) : undefined,
        grade: w.grade || undefined,
        expGained: w.expGained || undefined,
        caloriesBurned: w.caloriesBurned ? Number(w.caloriesBurned) : undefined,
        videoUrl: w.videoUrl || undefined,
        notes: w.notes || undefined,
        verified: w.verified,
        workoutDate: w.workoutDate.toISOString().split('T')[0],
        createdAt: w.createdAt.toISOString(),
      })),
      total,
      stats: {
        totalWorkouts,
        totalCalories: Math.round(totalCalories * 10) / 10,
        totalVolume: Math.round(totalVolume),
        recentPRs: recentPRs.map((pr) => ({
          bodyPartId: pr.bodyPartId,
          bodyPartName: pr.bodyPartName,
          exerciseName: pr.exerciseName,
          weight: pr.weight,
          reps: pr.reps,
          date: pr.date.toISOString().split('T')[0],
        })),
      },
    });
  } catch (error) {
    next(error);
  }
}
