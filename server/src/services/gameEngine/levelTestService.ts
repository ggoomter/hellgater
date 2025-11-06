import prisma from '../../config/database.js';
import { HttpError } from '../../middleware/errorHandler.js';

/**
 * 레벨테스트 조건 인터페이스
 */
export interface LevelTestCondition {
  exerciseId: number;
  exerciseName: string;
  requiredWeight: number;
  requiredReps: number;
  requiredSets: number;
}

/**
 * 레벨테스트 시작 결과
 */
export interface LevelTestStartResult {
  levelTest: {
    id: string;
    targetLevel: number;
    conditions: LevelTestCondition;
  };
}

/**
 * 레벨테스트 제출 결과
 */
export interface LevelTestSubmitResult {
  success: boolean;
  levelTest: {
    id: string;
    status: string;
    submittedAt: Date;
  };
}

/**
 * 레벨테스트 승인 결과
 */
export interface LevelTestApproveResult {
  success: boolean;
  leveledUp: boolean;
  newLevel: number;
}

/**
 * 레벨테스트 시스템 서비스
 * 레벨업을 위한 인증 절차를 관리합니다.
 */
class LevelTestService {
  /**
   * 레벨업에 필요한 경험치 계산
   * 공식: baseExp(1000) × growthFactor(1.15)^(level-1)
   *
   * @param level - 목표 레벨
   * @returns 필요한 경험치
   */
  getRequiredExpForLevel(level: number): number {
    const baseExp = 1000;
    const growthFactor = 1.15;
    return Math.round(baseExp * Math.pow(growthFactor, level - 1));
  }

  /**
   * 레벨테스트 조건 생성
   * 부위별, 레벨별로 다른 조건 생성
   *
   * @param bodyPartId - 신체 부위 ID
   * @param targetLevel - 목표 레벨
   * @param userWeight - 사용자 체중 (kg)
   * @param userGender - 사용자 성별
   * @returns 레벨테스트 조건
   */
  async generateLevelTestConditions(
    bodyPartId: number,
    targetLevel: number,
    userWeight: number,
    userGender: string
  ): Promise<LevelTestCondition> {
    // 부위별 대표 운동 가져오기 (실제로는 Exercise 테이블에서 조회)
    // 여기서는 간단하게 하드코딩
    const bodyPartExercises: Record<number, { id: number; name: string }> = {
      1: { id: 1, name: '오버헤드 프레스' },      // Shoulder
      2: { id: 2, name: '벤치프레스' },           // Chest
      3: { id: 3, name: '데드리프트' },           // Back
      4: { id: 4, name: '바벨 컬' },              // Arm
      5: { id: 5, name: '행잉 레그 레이즈' },     // Abdominal
      6: { id: 6, name: '힙 스러스트' },          // Hip
      7: { id: 7, name: '스쿼트' },               // Leg
    };

    const exercise = bodyPartExercises[bodyPartId] || { id: 1, name: '기본 운동' };

    // 레벨별 요구 무게 계산
    // 공식: 체중 × 부위별 계수 × (1 + targetLevel × 0.1)
    const bodyPartCoefficients: Record<number, number> = {
      1: 0.4,  // Shoulder (체중의 40%부터)
      2: 0.6,  // Chest (체중의 60%부터)
      3: 1.0,  // Back (체중의 100%부터)
      4: 0.3,  // Arm (체중의 30%부터)
      5: 0.0,  // Abdominal (맨몸 운동)
      6: 1.2,  // Hip (체중의 120%부터)
      7: 1.0,  // Leg (체중의 100%부터)
    };

    const isMale = userGender === 'MALE';
    const genderMultiplier = isMale ? 1.0 : 0.7; // 여성은 70%
    const coefficient = bodyPartCoefficients[bodyPartId] || 0.5;
    const levelMultiplier = 1 + targetLevel * 0.1;

    const requiredWeight = Math.round(
      userWeight * coefficient * levelMultiplier * genderMultiplier
    );

    // 레벨별 요구 횟수 및 세트
    const requiredReps = targetLevel <= 5 ? 10 : targetLevel <= 10 ? 8 : 5;
    const requiredSets = targetLevel <= 10 ? 3 : 5;

    return {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      requiredWeight: Math.max(requiredWeight, 5), // 최소 5kg
      requiredReps,
      requiredSets,
    };
  }

  /**
   * 레벨테스트 시작 가능 여부 확인
   *
   * @param userId - 사용자 ID
   * @param bodyPartId - 신체 부위 ID
   * @returns 시작 가능 여부
   */
  async canStartLevelTest(userId: string, bodyPartId: number): Promise<boolean> {
    const userBodyPart = await prisma.userBodyPart.findUnique({
      where: {
        userId_bodyPartId: {
          userId,
          bodyPartId,
        },
      },
    });

    if (!userBodyPart) {
      throw new HttpError(404, '해당 신체 부위를 찾을 수 없습니다.');
    }

    // 1. 경험치가 충분한지 확인
    const requiredExp = this.getRequiredExpForLevel(userBodyPart.level + 1);
    if (userBodyPart.currentExp < requiredExp) {
      return false;
    }

    // 2. 이미 진행 중인 레벨테스트가 있는지 확인
    const ongoingTest = await prisma.levelTest.findFirst({
      where: {
        userId,
        bodyPartId,
        status: {
          in: ['PENDING', 'IN_PROGRESS', 'SUBMITTED'],
        },
      },
    });

    if (ongoingTest) {
      return false;
    }

    return true;
  }

  /**
   * 레벨테스트 시작
   *
   * @param userId - 사용자 ID
   * @param bodyPartId - 신체 부위 ID
   * @returns 레벨테스트 정보
   */
  async startLevelTest(
    userId: string,
    bodyPartId: number
  ): Promise<LevelTestStartResult> {
    // 1. 시작 가능 여부 확인
    const canStart = await this.canStartLevelTest(userId, bodyPartId);
    if (!canStart) {
      throw new HttpError(
        400,
        '레벨테스트를 시작할 수 없습니다. 경험치가 부족하거나 이미 진행 중인 테스트가 있습니다.'
      );
    }

    // 2. 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { weight: true, gender: true },
    });

    if (!user || !user.weight || !user.gender) {
      throw new HttpError(400, '사용자 정보가 불완전합니다. 체중과 성별을 입력해주세요.');
    }

    // 3. UserBodyPart 조회
    const userBodyPart = await prisma.userBodyPart.findUnique({
      where: {
        userId_bodyPartId: {
          userId,
          bodyPartId,
        },
      },
    });

    if (!userBodyPart) {
      throw new HttpError(404, '해당 신체 부위를 찾을 수 없습니다.');
    }

    // 4. 테스트 조건 생성
    const targetLevel = userBodyPart.level + 1;
    const conditions = await this.generateLevelTestConditions(
      bodyPartId,
      targetLevel,
      Number(user.weight),
      user.gender
    );

    // 5. LevelTest 생성
    const levelTest = await prisma.levelTest.create({
      data: {
        userId,
        bodyPartId,
        userBodyPartId: userBodyPart.id,
        currentLevel: userBodyPart.level,
        targetLevel,
        conditions,
        status: 'IN_PROGRESS',
      },
    });

    // 6. UserBodyPart 상태 업데이트
    await prisma.userBodyPart.update({
      where: {
        userId_bodyPartId: {
          userId,
          bodyPartId,
        },
      },
      data: {
        levelTestStatus: 'IN_PROGRESS',
        targetLevelForTest: targetLevel,
      },
    });

    return {
      levelTest: {
        id: levelTest.id,
        targetLevel,
        conditions,
      },
    };
  }

  /**
   * 레벨테스트 제출
   * 운동 기록과 함께 제출
   *
   * @param userId - 사용자 ID
   * @param levelTestId - 레벨테스트 ID
   * @param workoutRecordId - 운동 기록 ID
   * @param videoUrl - 영상 URL (선택)
   * @returns 제출 결과
   */
  async submitLevelTest(
    userId: string,
    levelTestId: string,
    workoutRecordId: string,
    videoUrl?: string
  ): Promise<LevelTestSubmitResult> {
    // 1. 레벨테스트 조회
    const levelTest = await prisma.levelTest.findUnique({
      where: { id: levelTestId },
      include: { userBodyPart: true },
    });

    if (!levelTest) {
      throw new HttpError(404, '레벨테스트를 찾을 수 없습니다.');
    }

    if (levelTest.userId !== userId) {
      throw new HttpError(403, '권한이 없습니다.');
    }

    if (levelTest.status !== 'IN_PROGRESS') {
      throw new HttpError(400, '진행 중인 레벨테스트가 아닙니다.');
    }

    // 2. 운동 기록 조회
    const workoutRecord = await prisma.workoutRecord.findUnique({
      where: { id: workoutRecordId },
    });

    if (!workoutRecord) {
      throw new HttpError(404, '운동 기록을 찾을 수 없습니다.');
    }

    if (workoutRecord.userId !== userId) {
      throw new HttpError(403, '권한이 없습니다.');
    }

    // 3. 조건 충족 여부 확인
    const conditions = levelTest.conditions as LevelTestCondition;
    const meetsConditions =
      workoutRecord.exerciseId === conditions.exerciseId &&
      workoutRecord.sets >= conditions.requiredSets &&
      workoutRecord.reps >= conditions.requiredReps &&
      Number(workoutRecord.weight) >= conditions.requiredWeight;

    if (!meetsConditions) {
      throw new HttpError(
        400,
        '레벨테스트 조건을 충족하지 못했습니다. 다시 시도해주세요.'
      );
    }

    // 4. 레벨테스트 업데이트 (자동 승인 또는 검토 대기)
    const autoApprove = true; // 나중에 영상 검토 기능 추가 시 false로 변경

    const updatedLevelTest = await prisma.levelTest.update({
      where: { id: levelTestId },
      data: {
        workoutRecordId,
        videoUrl,
        submittedAt: new Date(),
        status: autoApprove ? 'APPROVED' : 'SUBMITTED',
        reviewedAt: autoApprove ? new Date() : null,
      },
    });

    // 5. 자동 승인 시 레벨업 처리
    if (autoApprove) {
      await this.approveLevelTest(userId, levelTestId);
    }

    return {
      success: true,
      levelTest: {
        id: updatedLevelTest.id,
        status: updatedLevelTest.status,
        submittedAt: updatedLevelTest.submittedAt!,
      },
    };
  }

  /**
   * 레벨테스트 승인 (레벨업 처리)
   *
   * @param userId - 사용자 ID
   * @param levelTestId - 레벨테스트 ID
   * @returns 승인 결과
   */
  async approveLevelTest(
    userId: string,
    levelTestId: string
  ): Promise<LevelTestApproveResult> {
    // 1. 레벨테스트 조회
    const levelTest = await prisma.levelTest.findUnique({
      where: { id: levelTestId },
      include: { userBodyPart: true },
    });

    if (!levelTest) {
      throw new HttpError(404, '레벨테스트를 찾을 수 없습니다.');
    }

    if (levelTest.status === 'APPROVED') {
      // 이미 승인됨
      return {
        success: true,
        leveledUp: true,
        newLevel: levelTest.targetLevel,
      };
    }

    // 2. 트랜잭션으로 레벨업 처리
    const result = await prisma.$transaction(async (tx) => {
      // 2-1. UserBodyPart 레벨업
      const updatedBodyPart = await tx.userBodyPart.update({
        where: {
          userId_bodyPartId: {
            userId,
            bodyPartId: levelTest.bodyPartId,
          },
        },
        data: {
          level: levelTest.targetLevel,
          currentExp: 0, // 레벨업 후 경험치 초기화
          levelTestStatus: 'NONE',
          canTakeLevelTest: false,
          targetLevelForTest: null,
        },
      });

      // 2-2. LevelTest 승인
      await tx.levelTest.update({
        where: { id: levelTestId },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date(),
        },
      });

      return { updatedBodyPart };
    });

    return {
      success: true,
      leveledUp: true,
      newLevel: result.updatedBodyPart.level,
    };
  }

  /**
   * 경험치 획득 후 레벨테스트 가능 여부 업데이트
   *
   * @param userId - 사용자 ID
   * @param bodyPartId - 신체 부위 ID
   */
  async checkAndUpdateLevelTestAvailability(
    userId: string,
    bodyPartId: number
  ): Promise<void> {
    const userBodyPart = await prisma.userBodyPart.findUnique({
      where: {
        userId_bodyPartId: {
          userId,
          bodyPartId,
        },
      },
    });

    if (!userBodyPart) return;

    // 경험치가 충분하면 레벨테스트 가능 상태로 변경
    const requiredExp = this.getRequiredExpForLevel(userBodyPart.level + 1);
    const canTest = userBodyPart.currentExp >= requiredExp;

    if (canTest && !userBodyPart.canTakeLevelTest) {
      await prisma.userBodyPart.update({
        where: {
          userId_bodyPartId: {
            userId,
            bodyPartId,
          },
        },
        data: {
          canTakeLevelTest: true,
          targetLevelForTest: userBodyPart.level + 1,
        },
      });
    }
  }
}

export const levelTestService = new LevelTestService();
