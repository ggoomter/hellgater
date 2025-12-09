import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// 신체 측정 기록 조회
export const getMeasurements = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { limit = '10' } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다',
      });
    }

    const measurements = await prisma.bodyMeasurement.findMany({
      where: { userId },
      orderBy: { measurementDate: 'desc' },
      take: parseInt(limit as string),
    });

    res.json({
      success: true,
      data: measurements,
    });
  } catch (error) {
    console.error('Error fetching measurements:', error);
    res.status(500).json({
      success: false,
      message: '측정 기록 조회 실패',
    });
  }
};

// 최근 측정 기록 조회
export const getLatestMeasurement = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다',
      });
    }

    const measurement = await prisma.bodyMeasurement.findFirst({
      where: { userId },
      orderBy: { measurementDate: 'desc' },
    });

    res.json({
      success: true,
      data: measurement,
    });
  } catch (error) {
    console.error('Error fetching latest measurement:', error);
    res.status(500).json({
      success: false,
      message: '최근 측정 기록 조회 실패',
    });
  }
};

// 신체 측정 기록 생성
export const createMeasurement = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다',
      });
    }

    const {
      weight,
      height,
      bodyFatPercentage,
      skeletalMuscleMass,
      bmr,
      waistCircumference,
      hipCircumference,
      chestCircumference,
      armCircumference,
      thighCircumference,
      measurementDate,
      measurementTime,
      measurementLocation,
      measurementDevice,
      notes,
    } = req.body;

    // BMI 계산
    let bmi: Prisma.Decimal | undefined;
    if (weight && height) {
      const heightInMeters = parseFloat(height) / 100;
      bmi = new Prisma.Decimal(
        (parseFloat(weight) / (heightInMeters * heightInMeters)).toFixed(2)
      );
    }

    // 체지방량 계산
    let bodyFatMass: Prisma.Decimal | undefined;
    if (weight && bodyFatPercentage) {
      bodyFatMass = new Prisma.Decimal(
        ((parseFloat(weight) * parseFloat(bodyFatPercentage)) / 100).toFixed(2)
      );
    }

    // 제지방량 계산
    let leanBodyMass: Prisma.Decimal | undefined;
    if (weight && bodyFatMass) {
      leanBodyMass = new Prisma.Decimal(
        (parseFloat(weight) - parseFloat(bodyFatMass.toString())).toFixed(2)
      );
    }

    const measurement = await prisma.bodyMeasurement.create({
      data: {
        userId,
        weight: new Prisma.Decimal(weight),
        height: height ? new Prisma.Decimal(height) : undefined,
        bodyFatPercentage: bodyFatPercentage
          ? new Prisma.Decimal(bodyFatPercentage)
          : undefined,
        skeletalMuscleMass: skeletalMuscleMass
          ? new Prisma.Decimal(skeletalMuscleMass)
          : undefined,
        bmr,
        waistCircumference: waistCircumference
          ? new Prisma.Decimal(waistCircumference)
          : undefined,
        hipCircumference: hipCircumference
          ? new Prisma.Decimal(hipCircumference)
          : undefined,
        chestCircumference: chestCircumference
          ? new Prisma.Decimal(chestCircumference)
          : undefined,
        armCircumference: armCircumference
          ? new Prisma.Decimal(armCircumference)
          : undefined,
        thighCircumference: thighCircumference
          ? new Prisma.Decimal(thighCircumference)
          : undefined,
        bmi,
        bodyFatMass,
        leanBodyMass,
        measurementDate: new Date(measurementDate || Date.now()),
        measurementTime: measurementTime ? new Date(measurementTime) : undefined,
        measurementLocation,
        measurementDevice,
        notes,
      },
    });

    res.status(201).json({
      success: true,
      message: '측정 기록이 생성되었습니다',
      data: measurement,
    });
  } catch (error) {
    console.error('Error creating measurement:', error);
    res.status(500).json({
      success: false,
      message: '측정 기록 생성 실패',
    });
  }
};

// 진행 사진 조회
export const getProgressPhotos = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { photoType, limit = '20' } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다',
      });
    }

    const where: any = { userId };
    if (photoType) {
      where.photoType = photoType;
    }

    const photos = await prisma.progressPhoto.findMany({
      where,
      orderBy: { photoDate: 'desc' },
      take: parseInt(limit as string),
    });

    res.json({
      success: true,
      data: photos,
    });
  } catch (error) {
    console.error('Error fetching progress photos:', error);
    res.status(500).json({
      success: false,
      message: '진행 사진 조회 실패',
    });
  }
};

// 진행 사진 업로드
export const uploadProgressPhoto = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다',
      });
    }

    const {
      photoType,
      photoUrl,
      thumbnailUrl,
      photoDate,
      photoTime,
      measurementId,
      weekNumber,
      isPublic,
      fileSizeBytes,
      imageWidth,
      imageHeight,
    } = req.body;

    const photo = await prisma.progressPhoto.create({
      data: {
        userId,
        photoType,
        photoUrl,
        thumbnailUrl,
        photoDate: new Date(photoDate || Date.now()),
        photoTime: photoTime ? new Date(photoTime) : undefined,
        measurementId,
        weekNumber,
        isPublic: isPublic || false,
        fileSizeBytes,
        imageWidth,
        imageHeight,
      },
    });

    res.status(201).json({
      success: true,
      message: '진행 사진이 업로드되었습니다',
      data: photo,
    });
  } catch (error) {
    console.error('Error uploading progress photo:', error);
    res.status(500).json({
      success: false,
      message: '진행 사진 업로드 실패',
    });
  }
};

// 목표 조회
export const getGoals = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다',
      });
    }

    const goals = await prisma.userGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: goals,
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({
      success: false,
      message: '목표 조회 실패',
    });
  }
};

// 활성 목표 조회
export const getActiveGoal = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다',
      });
    }

    const goal = await prisma.userGoal.findFirst({
      where: {
        userId,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: goal,
    });
  } catch (error) {
    console.error('Error fetching active goal:', error);
    res.status(500).json({
      success: false,
      message: '활성 목표 조회 실패',
    });
  }
};

// 목표 생성
export const createGoal = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다',
      });
    }

    const {
      goalType,
      targetWeight,
      targetBodyFatPercentage,
      targetMuscleMass,
      startDate,
      targetDate,
      startingWeight,
      startingBodyFat,
      motivation,
      notes,
    } = req.body;

    const goal = await prisma.userGoal.create({
      data: {
        userId,
        goalType,
        targetWeight: targetWeight ? new Prisma.Decimal(targetWeight) : undefined,
        targetBodyFatPercentage: targetBodyFatPercentage
          ? new Prisma.Decimal(targetBodyFatPercentage)
          : undefined,
        targetMuscleMass: targetMuscleMass
          ? new Prisma.Decimal(targetMuscleMass)
          : undefined,
        startDate: new Date(startDate),
        targetDate: new Date(targetDate),
        startingWeight: startingWeight
          ? new Prisma.Decimal(startingWeight)
          : undefined,
        startingBodyFat: startingBodyFat
          ? new Prisma.Decimal(startingBodyFat)
          : undefined,
        currentWeight: startingWeight
          ? new Prisma.Decimal(startingWeight)
          : undefined,
        currentBodyFat: startingBodyFat
          ? new Prisma.Decimal(startingBodyFat)
          : undefined,
        motivation,
        notes,
      },
    });

    res.status(201).json({
      success: true,
      message: '목표가 생성되었습니다',
      data: goal,
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({
      success: false,
      message: '목표 생성 실패',
    });
  }
};

// 목표 업데이트
export const updateGoal = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { goalId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다',
      });
    }

    const { currentWeight, currentBodyFat, notes } = req.body;

    // 목표 소유권 확인
    const existingGoal = await prisma.userGoal.findUnique({
      where: { id: goalId },
    });

    if (!existingGoal || existingGoal.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: '목표를 찾을 수 없습니다',
      });
    }

    // 진행률 계산
    let progressPercentage = 0;
    if (
      currentWeight &&
      existingGoal.startingWeight &&
      existingGoal.targetWeight
    ) {
      const totalChange =
        parseFloat(existingGoal.targetWeight.toString()) -
        parseFloat(existingGoal.startingWeight.toString());
      const currentChange =
        parseFloat(currentWeight) -
        parseFloat(existingGoal.startingWeight.toString());
      progressPercentage = Math.min(
        100,
        Math.max(0, Math.round((currentChange / totalChange) * 100))
      );
    }

    const goal = await prisma.userGoal.update({
      where: { id: goalId },
      data: {
        currentWeight: currentWeight
          ? new Prisma.Decimal(currentWeight)
          : undefined,
        currentBodyFat: currentBodyFat
          ? new Prisma.Decimal(currentBodyFat)
          : undefined,
        progressPercentage,
        notes,
      },
    });

    res.json({
      success: true,
      message: '목표가 업데이트되었습니다',
      data: goal,
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({
      success: false,
      message: '목표 업데이트 실패',
    });
  }
};

// 목표 완료 처리
export const completeGoal = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { goalId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다',
      });
    }

    // 목표 소유권 확인
    const existingGoal = await prisma.userGoal.findUnique({
      where: { id: goalId },
    });

    if (!existingGoal || existingGoal.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: '목표를 찾을 수 없습니다',
      });
    }

    const goal = await prisma.userGoal.update({
      where: { id: goalId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        progressPercentage: 100,
      },
    });

    res.json({
      success: true,
      message: '목표를 완료했습니다! 축하합니다! 🎉',
      data: goal,
    });
  } catch (error) {
    console.error('Error completing goal:', error);
    res.status(500).json({
      success: false,
      message: '목표 완료 처리 실패',
    });
  }
};
