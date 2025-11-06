import prisma from '../../config/database';

/**
 * 1RM 분석 결과 인터페이스
 */
export interface RMAnalysisResult {
  calculated1RM: number;        // 계산된 1RM (kg)
  rmPercentage: number;         // 체중 대비 비율 (%)
  grade: string;                // 등급 (BRONZE ~ CHALLENGER)
  isPersonalRecord: boolean;    // 개인 최고 기록 여부
}

/**
 * 등급별 체중 대비 1RM 기준 (%)
 * 부위별, 성별로 다른 기준 적용
 */
interface GradeThresholds {
  bronze: number;
  silver: number;
  gold: number;
  platinum: number;
  diamond: number;
  master: number;
  challenger: number;
}

/**
 * 1RM 분석 서비스
 * Epley 공식을 사용하여 1RM을 계산하고 등급을 판정합니다.
 */
class RMAnalysisService {
  /**
   * Epley 공식으로 1RM 계산
   * 공식: 1RM = weight × (1 + reps / 30)
   *
   * @param weight - 들어올린 무게 (kg)
   * @param reps - 반복 횟수
   * @returns 계산된 1RM (kg)
   */
  calculate1RM(weight: number, reps: number): number {
    if (reps === 1) {
      return weight;
    }
    const oneRM = weight * (1 + reps / 30);
    return Math.round(oneRM * 10) / 10; // 소수점 첫째자리까지
  }

  /**
   * 체중 대비 1RM 비율 계산
   *
   * @param oneRM - 1RM 무게 (kg)
   * @param userWeight - 사용자 체중 (kg)
   * @returns 체중 대비 비율 (%)
   */
  calculateRMPercentage(oneRM: number, userWeight: number): number {
    const percentage = (oneRM / userWeight) * 100;
    return Math.round(percentage * 10) / 10; // 소수점 첫째자리까지
  }

  /**
   * 부위별, 성별 등급 기준 가져오기
   *
   * 기준 예시 (체중 대비 %):
   * - 벤치프레스 (남성): Bronze 50%, Silver 75%, Gold 100%, Platinum 125%, Diamond 150%, Master 175%, Challenger 200%+
   * - 데드리프트 (남성): Bronze 100%, Silver 150%, Gold 200%, Platinum 250%, Diamond 300%, Master 350%, Challenger 400%+
   *
   * @param bodyPartId - 신체 부위 ID (1~7)
   * @param userGender - 사용자 성별 ('MALE' | 'FEMALE')
   * @returns 등급별 기준 (체중 대비 %)
   */
  private getGradeThresholds(bodyPartId: number, userGender: string): GradeThresholds {
    const isMale = userGender === 'MALE';

    // 부위별 기준 정의
    const thresholds: Record<number, { male: GradeThresholds; female: GradeThresholds }> = {
      1: { // Shoulder (어깨)
        male: { bronze: 30, silver: 45, gold: 60, platinum: 75, diamond: 90, master: 105, challenger: 120 },
        female: { bronze: 15, silver: 25, gold: 35, platinum: 50, diamond: 65, master: 80, challenger: 100 },
      },
      2: { // Chest (가슴)
        male: { bronze: 50, silver: 75, gold: 100, platinum: 125, diamond: 150, master: 175, challenger: 200 },
        female: { bronze: 20, silver: 35, gold: 50, platinum: 65, diamond: 80, master: 95, challenger: 115 },
      },
      3: { // Back (등)
        male: { bronze: 60, silver: 90, gold: 120, platinum: 150, diamond: 180, master: 210, challenger: 250 },
        female: { bronze: 30, silver: 45, gold: 65, platinum: 85, diamond: 105, master: 125, challenger: 150 },
      },
      4: { // Arm (팔)
        male: { bronze: 25, silver: 40, gold: 55, platinum: 70, diamond: 85, master: 100, challenger: 120 },
        female: { bronze: 10, silver: 20, gold: 30, platinum: 40, diamond: 50, master: 60, challenger: 75 },
      },
      5: { // Abdominal (복근)
        male: { bronze: 30, silver: 50, gold: 70, platinum: 90, diamond: 110, master: 130, challenger: 150 },
        female: { bronze: 15, silver: 30, gold: 45, platinum: 60, diamond: 75, master: 90, challenger: 110 },
      },
      6: { // Hip (엉덩이)
        male: { bronze: 80, silver: 120, gold: 160, platinum: 200, diamond: 240, master: 280, challenger: 330 },
        female: { bronze: 50, silver: 75, gold: 100, platinum: 130, diamond: 160, master: 190, challenger: 230 },
      },
      7: { // Leg (다리)
        male: { bronze: 100, silver: 150, gold: 200, platinum: 250, diamond: 300, master: 350, challenger: 400 },
        female: { bronze: 60, silver: 90, gold: 120, platinum: 155, diamond: 190, master: 225, challenger: 270 },
      },
    };

    const bodyPartThreshold = thresholds[bodyPartId];
    if (!bodyPartThreshold) {
      // 기본값 (중간 난이도)
      return isMale
        ? { bronze: 50, silver: 75, gold: 100, platinum: 125, diamond: 150, master: 175, challenger: 200 }
        : { bronze: 25, silver: 40, gold: 55, platinum: 70, diamond: 85, master: 100, challenger: 120 };
    }

    return isMale ? bodyPartThreshold.male : bodyPartThreshold.female;
  }

  /**
   * 체중 대비 비율을 기반으로 등급 판정
   *
   * @param rmPercentage - 체중 대비 1RM 비율 (%)
   * @param bodyPartId - 신체 부위 ID
   * @param userGender - 사용자 성별
   * @returns 등급 문자열
   */
  getGrade(rmPercentage: number, bodyPartId: number, userGender: string): string {
    const thresholds = this.getGradeThresholds(bodyPartId, userGender);

    if (rmPercentage >= thresholds.challenger) return 'CHALLENGER';
    if (rmPercentage >= thresholds.master) return 'MASTER';
    if (rmPercentage >= thresholds.diamond) return 'DIAMOND';
    if (rmPercentage >= thresholds.platinum) return 'PLATINUM';
    if (rmPercentage >= thresholds.gold) return 'GOLD';
    if (rmPercentage >= thresholds.silver) return 'SILVER';
    return 'BRONZE';
  }

  /**
   * 개인 최고 기록 체크
   *
   * @param userId - 사용자 ID
   * @param exerciseId - 운동 종목 ID
   * @param oneRM - 현재 계산된 1RM
   * @returns 개인 최고 기록 여부
   */
  async isPersonalRecord(userId: string, exerciseId: number, oneRM: number): Promise<boolean> {
    const bestRecord = await prisma.workoutRecord.findFirst({
      where: {
        userId,
        exerciseId,
      },
      orderBy: {
        calculated1RM: 'desc',
      },
    });

    // 기록이 없거나, 현재 1RM이 더 크면 PR
    return !bestRecord || oneRM > Number(bestRecord.calculated1RM);
  }

  /**
   * 종합 1RM 분석 실행
   *
   * @param params - 분석 파라미터
   * @returns 분석 결과 객체
   */
  async analyze(params: {
    userId: string;
    exerciseId: number;
    bodyPartId: number;
    weight: number;
    reps: number;
    userWeight: number;
    userGender: string;
  }): Promise<RMAnalysisResult> {
    const { userId, exerciseId, bodyPartId, weight, reps, userWeight, userGender } = params;

    // 1. 1RM 계산
    const calculated1RM = this.calculate1RM(weight, reps);

    // 2. 체중 대비 비율 계산
    const rmPercentage = this.calculateRMPercentage(calculated1RM, userWeight);

    // 3. 등급 판정
    const grade = this.getGrade(rmPercentage, bodyPartId, userGender);

    // 4. 개인 최고 기록 체크
    const isPersonalRecord = await this.isPersonalRecord(userId, exerciseId, calculated1RM);

    return {
      calculated1RM,
      rmPercentage,
      grade,
      isPersonalRecord,
    };
  }
}

export const rmAnalysisService = new RMAnalysisService();
