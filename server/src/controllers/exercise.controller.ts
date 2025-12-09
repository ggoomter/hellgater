import { Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { AuthRequest } from '../types/auth.types.js';

/**
 * GET /api/v1/exercises/body-parts
 * 모든 운동 부위 목록 조회
 */
export const getBodyParts = async (req: AuthRequest, res: Response) => {
  try {
    const bodyParts = await prisma.bodyPart.findMany({
      orderBy: {
        displayOrder: 'asc',
      },
      select: {
        id: true,
        code: true,
        nameKo: true,
        nameEn: true,
        displayOrder: true,
        _count: {
          select: {
            exercises: true, // 해당 부위의 운동 개수
          },
        },
      },
    });

    res.json({
      bodyParts: bodyParts.map((bp) => ({
        id: bp.id,
        code: bp.code,
        nameKo: bp.nameKo,
        nameEn: bp.nameEn,
        displayOrder: bp.displayOrder,
        exerciseCount: bp._count.exercises,
      })),
    });
  } catch (error) {
    console.error('❌ Get body parts error:', error);
    res.status(500).json({
      message: '부위 목록 조회에 실패했습니다.',
    });
  }
};

/**
 * GET /api/v1/exercises/by-body-part/:bodyPartId
 * 특정 부위의 운동 목록 조회
 */
export const getExercisesByBodyPart = async (req: AuthRequest, res: Response) => {
  try {
    const { bodyPartId } = req.params;

    const exercises = await prisma.exercise.findMany({
      where: {
        bodyPartId: Number(bodyPartId),
        isActive: true,
      },
      select: {
        id: true,
        code: true,
        nameKo: true,
        nameEn: true,
        category: true,
        difficulty: true,
        description: true,
        thumbnailUrl: true,
        bodyPart: {
          select: {
            nameKo: true,
            nameEn: true,
          },
        },
      },
      orderBy: {
        difficulty: 'asc', // beginner → intermediate → advanced
      },
    });

    res.json({
      exercises: exercises.map((ex) => ({
        id: ex.id,
        code: ex.code,
        nameKo: ex.nameKo,
        nameEn: ex.nameEn,
        category: ex.category,
        difficulty: ex.difficulty,
        description: ex.description,
        thumbnailUrl: ex.thumbnailUrl,
        bodyPartName: ex.bodyPart.nameKo,
      })),
    });
  } catch (error) {
    console.error('❌ Get exercises by body part error:', error);
    res.status(500).json({
      message: '운동 목록 조회에 실패했습니다.',
    });
  }
};

/**
 * GET /api/v1/exercises/:exerciseId
 * 특정 운동의 상세 정보 조회
 */
export const getExerciseDetail = async (req: AuthRequest, res: Response) => {
  try {
    const { exerciseId } = req.params;

    const exercise = await prisma.exercise.findUnique({
      where: {
        id: Number(exerciseId),
      },
      include: {
        bodyPart: {
          select: {
            nameKo: true,
            nameEn: true,
          },
        },
      },
    });

    if (!exercise) {
      return res.status(404).json({
        message: '운동을 찾을 수 없습니다.',
      });
    }

    res.json({
      exercise: {
        id: exercise.id,
        code: exercise.code,
        nameKo: exercise.nameKo,
        nameEn: exercise.nameEn,
        category: exercise.category,
        difficulty: exercise.difficulty,
        description: exercise.description,
        howTo: exercise.howTo,
        videoUrl: exercise.videoUrl,
        thumbnailUrl: exercise.thumbnailUrl,
        caloriePerRepKg: exercise.caloriePerRepKg,
        bodyPartName: exercise.bodyPart.nameKo,
      },
    });
  } catch (error) {
    console.error('❌ Get exercise detail error:', error);
    res.status(500).json({
      message: '운동 정보 조회에 실패했습니다.',
    });
  }
};
