import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler.js';

const prisma = new PrismaClient();

// 모든 스킬 조회 (트리 구조용)
export const getAllSkills = asyncHandler(async (req: Request, res: Response) => {
  const { bodyPartId } = req.query;

  const where = bodyPartId ? { bodyPartId: Number(bodyPartId) } : {};

  const skills = await prisma.skill.findMany({
    where,
    orderBy: { id: 'asc' },
    include: {
        userSkills: {
            where: { userId: req.user?.id },
            select: { unlockedAt: true, timesUsed: true }
        }
    }
  });

  const formattedSkills = skills.map(skill => ({
      ...skill,
      isUnlocked: skill.userSkills.length > 0
  }));

  res.json({
    success: true,
    data: formattedSkills,
  });
});

// 스킬 상세 조회
export const getSkillDetail = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const skill = await prisma.skill.findUnique({
    where: { id: Number(id) },
    include: {
      bodyPart: true,
    },
  });

  if (!skill) {
    res.status(404).json({
      success: false,
      message: 'Skill not found',
    });
    return;
  }

  res.json({
    success: true,
    data: skill,
  });
});
