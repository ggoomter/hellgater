import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';

const prisma = new PrismaClient();

// 모든 주차 목록 조회
export const getAllWeeks = asyncHandler(async (req: Request, res: Response) => {
  const weeks = await prisma.curriculumWeek.findMany({
    where: { isPublished: true },
    orderBy: { weekNumber: 'asc' },
    select: {
      id: true,
      weekNumber: true,
      titleKo: true,
      titleEn: true,
      subtitle: true,
      phase: true,
      chapter: true,
      attributeType: true,
      estimatedTime: true,
      difficulty: true,
      thumbnailUrl: true,
    },
  });

  res.json({
    success: true,
    data: weeks,
  });
});

// 특정 주차 상세 조회
export const getWeekByNumber = asyncHandler(async (req: Request, res: Response) => {
  const { weekNumber } = req.params;

  const week = await prisma.curriculumWeek.findUnique({
    where: { weekNumber: parseInt(weekNumber) },
    include: {
      contentModules: {
        orderBy: { displayOrder: 'asc' },
      },
    },
  });

  if (!week) {
    res.status(404).json({
      success: false,
      message: '해당 주차를 찾을 수 없습니다',
    });
    return;
  }

  res.json({
    success: true,
    data: week,
  });
});

// 특정 주차의 콘텐츠 모듈 조회
export const getWeekModules = asyncHandler(async (req: Request, res: Response) => {
  const { weekNumber } = req.params;

  const week = await prisma.curriculumWeek.findUnique({
    where: { weekNumber: parseInt(weekNumber) },
  });

  if (!week) {
    res.status(404).json({
      success: false,
      message: '해당 주차를 찾을 수 없습니다',
    });
    return;
  }

  const modules = await prisma.contentModule.findMany({
    where: { weekId: week.id },
    orderBy: { displayOrder: 'asc' },
  });

  res.json({
    success: true,
    data: modules,
  });
});

// 사용자별 커리큘럼 진행 상황 조회
export const getUserProgress = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: '인증이 필요합니다',
    });
    return;
  }

  const progress = await prisma.userCurriculumProgress.findMany({
    where: { userId },
    include: {
      week: {
        select: {
          weekNumber: true,
          titleKo: true,
          titleEn: true,
          thumbnailUrl: true,
          estimatedTime: true,
        },
      },
    },
    orderBy: {
      week: {
        weekNumber: 'asc',
      },
    },
  });

  res.json({
    success: true,
    data: progress,
  });
});

// 특정 주차 진행 상황 조회
export const getWeekProgress = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { weekNumber } = req.params;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: '인증이 필요합니다',
    });
    return;
  }

  const week = await prisma.curriculumWeek.findUnique({
    where: { weekNumber: parseInt(weekNumber) },
  });

  if (!week) {
    res.status(404).json({
      success: false,
      message: '해당 주차를 찾을 수 없습니다',
    });
    return;
  }

  let progress = await prisma.userCurriculumProgress.findUnique({
    where: {
      userId_weekId: {
        userId,
        weekId: week.id,
      },
    },
    include: {
      week: true,
    },
  });

  // 진행 상황이 없으면 생성
  if (!progress) {
    progress = await prisma.userCurriculumProgress.create({
      data: {
        userId,
        weekId: week.id,
        status: weekNumber === '0' ? 'unlocked' : 'locked',
      },
      include: {
        week: true,
      },
    });
  }

  res.json({
    success: true,
    data: progress,
  });
});

// 주차 시작 (언락)
export const startWeek = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { weekNumber } = req.params;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: '인증이 필요합니다',
    });
    return;
  }

  const week = await prisma.curriculumWeek.findUnique({
    where: { weekNumber: parseInt(weekNumber) },
    include: {
      contentModules: true,
    },
  });

  if (!week) {
    res.status(404).json({
      success: false,
      message: '해당 주차를 찾을 수 없습니다',
    });
    return;
  }

  // 진행 상황 업데이트 또는 생성
  const progress = await prisma.userCurriculumProgress.upsert({
    where: {
      userId_weekId: {
        userId,
        weekId: week.id,
      },
    },
    update: {
      status: 'in_progress',
      startedAt: new Date(),
      totalModules: week.contentModules.length,
    },
    create: {
      userId,
      weekId: week.id,
      status: 'in_progress',
      unlockedAt: new Date(),
      startedAt: new Date(),
      totalModules: week.contentModules.length,
    },
  });

  res.json({
    success: true,
    message: '주차를 시작했습니다',
    data: progress,
  });
});

// 콘텐츠 모듈 완료 처리
export const completeModule = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { moduleId } = req.params;
  const { performanceData, expGained } = req.body;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: '인증이 필요합니다',
    });
    return;
  }

  const module = await prisma.contentModule.findUnique({
    where: { id: moduleId },
  });

  if (!module) {
    res.status(404).json({
      success: false,
      message: '콘텐츠 모듈을 찾을 수 없습니다',
    });
    return;
  }

  // 콘텐츠 완료 기록
  const completion = await prisma.userContentCompletion.upsert({
    where: {
      userId_moduleId: {
        userId,
        moduleId,
      },
    },
    update: {
      isCompleted: true,
      completedAt: new Date(),
      performanceData,
      expGained: expGained || module.expReward,
      lastAccessedAt: new Date(),
    },
    create: {
      userId,
      moduleId,
      isCompleted: true,
      completedAt: new Date(),
      performanceData,
      expGained: expGained || module.expReward,
    },
  });

  // 주차 진행 상황 업데이트
  const weekProgress = await prisma.userCurriculumProgress.findUnique({
    where: {
      userId_weekId: {
        userId,
        weekId: module.weekId,
      },
    },
  });

  if (weekProgress) {
    const completedCount = await prisma.userContentCompletion.count({
      where: {
        userId,
        module: {
          weekId: module.weekId,
        },
        isCompleted: true,
      },
    });

    const progressPercent = Math.round(
      (completedCount / weekProgress.totalModules) * 100
    );

    await prisma.userCurriculumProgress.update({
      where: {
        userId_weekId: {
          userId,
          weekId: module.weekId,
        },
      },
      data: {
        completedModules: completedCount,
        progressPercent,
        status: progressPercent === 100 ? 'completed' : 'in_progress',
        completedAt: progressPercent === 100 ? new Date() : null,
        lastAccessedAt: new Date(),
      },
    });
  }

  // 캐릭터 경험치 추가
  const character = await prisma.character.findUnique({
    where: { userId },
  });

  if (character) {
    await prisma.character.update({
      where: { userId },
      data: {
        totalExp: character.totalExp + (expGained || module.expReward),
      },
    });
  }

  res.json({
    success: true,
    message: '콘텐츠를 완료했습니다',
    data: completion,
  });
});

// 퀴즈 제출
export const submitQuiz = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { moduleId } = req.params;
  const { answers, score } = req.body;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: '인증이 필요합니다',
    });
    return;
  }

  const module = await prisma.contentModule.findUnique({
    where: { id: moduleId },
  });

  if (!module || module.moduleType !== 'quiz') {
    res.status(400).json({
      success: false,
      message: '유효하지 않은 퀴즈입니다',
    });
    return;
  }

  const performanceData = {
    answers,
    score,
    submittedAt: new Date().toISOString(),
  };

  // 퀴즈 제출 및 완료 처리
  const completion = await prisma.userContentCompletion.upsert({
    where: {
      userId_moduleId: {
        userId,
        moduleId,
      },
    },
    update: {
      isCompleted: true,
      completedAt: new Date(),
      performanceData,
      expGained: module.expReward,
      lastAccessedAt: new Date(),
    },
    create: {
      userId,
      moduleId,
      isCompleted: true,
      completedAt: new Date(),
      performanceData,
      expGained: module.expReward,
    },
  });

  res.json({
    success: true,
    message: '퀴즈를 제출했습니다',
    data: {
      score,
      expGained: module.expReward,
      completion,
    },
  });
});
