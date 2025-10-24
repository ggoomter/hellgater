import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { HttpError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

// Validation schemas
export const createCharacterSchema = z.object({
  body: z.object({
    // Profile data (저장될 곳: User 테이블)
    gender: z.enum(['male', 'female']),
    birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '생년월일 형식이 올바르지 않습니다 (YYYY-MM-DD)'),
    height: z.number().min(100).max(250, '키는 100-250cm 사이여야 합니다'),
    weight: z.number().min(30).max(300, '체중은 30-300kg 사이여야 합니다'),
    bodyFatPercentage: z.number().min(1).max(60).optional(),

    // Character appearance (저장될 곳: Character 테이블)
    characterModel: z.string().default('default'),
    skinColor: z.string().optional(),
  }),
});

/**
 * POST /api/v1/characters
 * 캐릭터 생성 (최초 1회만)
 */
export async function createCharacter(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw new HttpError(401, '인증이 필요합니다', 'UNAUTHORIZED');
    }

    const { gender, birthdate, height, weight, bodyFatPercentage, characterModel, skinColor } = req.body;
    const userId = req.user.userId;

    // 이미 캐릭터가 있는지 확인
    const existingCharacter = await prisma.character.findUnique({
      where: { userId },
    });

    if (existingCharacter) {
      throw new HttpError(409, '이미 캐릭터가 존재합니다', 'CHARACTER_ALREADY_EXISTS');
    }

    // 모든 부위 조회
    const bodyParts = await prisma.bodyPart.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    if (bodyParts.length === 0) {
      // BodyParts 테이블이 비어있으면 초기 데이터 삽입
      const initialBodyParts = [
        { code: 'shoulder', nameKo: '어깨', nameEn: 'Shoulder', displayOrder: 1 },
        { code: 'chest', nameKo: '가슴', nameEn: 'Chest', displayOrder: 2 },
        { code: 'back', nameKo: '등', nameEn: 'Back', displayOrder: 3 },
        { code: 'arm', nameKo: '팔', nameEn: 'Arm', displayOrder: 4 },
        { code: 'abdominal', nameKo: '복근', nameEn: 'Abdominal', displayOrder: 5 },
        { code: 'hip', nameKo: '엉덩이', nameEn: 'Hip', displayOrder: 6 },
        { code: 'leg', nameKo: '다리', nameEn: 'Leg', displayOrder: 7 },
      ];

      await prisma.bodyPart.createMany({
        data: initialBodyParts,
      });

      // 다시 조회
      const newBodyParts = await prisma.bodyPart.findMany({
        orderBy: { displayOrder: 'asc' },
      });

      bodyParts.push(...newBodyParts);
    }

    // 트랜잭션으로 User 업데이트 + 캐릭터 생성 + 부위별 레벨 생성
    const result = await prisma.$transaction(async (tx) => {
      // User 프로필 업데이트 (InBody 정보)
      await tx.user.update({
        where: { id: userId },
        data: {
          gender,
          birthdate: new Date(birthdate),
          height,
          weight,
          // 체지방률은 나중에 별도 테이블로 관리할 예정 (현재는 생략)
        },
      });

      // 캐릭터 생성
      const character = await tx.character.create({
        data: {
          userId,
          characterModel: characterModel || 'default',
          skinColor,
        },
      });

      // 7개 부위별 레벨 초기화
      const userBodyParts = await tx.userBodyPart.createMany({
        data: bodyParts.map((part) => ({
          userId,
          bodyPartId: part.id,
          level: 1,
          currentExp: 0,
        })),
      });

      return { character, userBodyPartsCount: userBodyParts.count };
    });

    logger.info(`Character and profile created for user: ${userId}`);

    res.status(201).json({
      success: true,
      data: result.character,
      message: `프로필과 캐릭터, ${result.userBodyPartsCount}개 부위가 생성되었습니다`,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/characters/me
 * 내 캐릭터 조회 (부위별 레벨 포함)
 */
export async function getMyCharacter(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw new HttpError(401, '인증이 필요합니다', 'UNAUTHORIZED');
    }

    const userId = req.user.userId;

    // 캐릭터 조회
    const character = await prisma.character.findUnique({
      where: { userId },
    });

    if (!character) {
      throw new HttpError(404, '캐릭터를 찾을 수 없습니다. 먼저 캐릭터를 생성해주세요', 'CHARACTER_NOT_FOUND');
    }

    // 부위별 레벨 조회
    const bodyParts = await prisma.userBodyPart.findMany({
      where: { userId },
      include: {
        bodyPart: {
          select: {
            code: true,
            nameKo: true,
            nameEn: true,
          },
        },
      },
      orderBy: {
        bodyPart: {
          displayOrder: 'asc',
        },
      },
    });

    // 다음 레벨 경험치 계산 (간단한 공식)
    const calculateNextLevelExp = (level: number): number => {
      const baseExp = 1000;
      const growthFactor = 1.15;
      return Math.round(baseExp * Math.pow(growthFactor, level - 1));
    };

    // 응답 데이터 구성
    const response = {
      id: character.id,
      characterModel: character.characterModel,
      totalLevel: character.totalLevel,
      totalExp: character.totalExp,
      nextLevelExp: calculateNextLevelExp(character.totalLevel),
      stats: {
        muscleEndurance: character.muscleEndurance,
        strength: character.strength,
        explosivePower: character.explosivePower,
        speed: character.speed,
        mentalPower: character.mentalPower,
        flexibility: character.flexibility,
        knowledge: character.knowledge,
        balance: character.balance,
        agility: character.agility,
      },
      attributes: {
        earth: character.earthProgress,
        fire: character.fireProgress,
        wind: character.windProgress,
        water: character.waterProgress,
        mind: character.mindProgress,
      },
      bodyParts: bodyParts.map((part) => ({
        id: part.id,
        code: part.bodyPart.code,
        name: part.bodyPart.nameKo,
        level: part.level,
        currentExp: part.currentExp,
        nextLevelExp: calculateNextLevelExp(part.level),
        max1RM: parseFloat(part.max1RmWeight.toString()),
        lastWorkoutAt: part.lastWorkoutAt?.toISOString(),
      })),
    };

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/characters/me
 * 내 캐릭터 수정 (외형만 변경 가능)
 */
export async function updateMyCharacter(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw new HttpError(401, '인증이 필요합니다', 'UNAUTHORIZED');
    }

    const { characterModel, skinColor } = req.body;
    const userId = req.user.userId;

    const character = await prisma.character.update({
      where: { userId },
      data: {
        characterModel,
        skinColor,
      },
    });

    res.json({
      success: true,
      data: character,
    });
  } catch (error) {
    if ((error as any).code === 'P2025') {
      next(new HttpError(404, '캐릭터를 찾을 수 없습니다', 'CHARACTER_NOT_FOUND'));
    } else {
      next(error);
    }
  }
}
