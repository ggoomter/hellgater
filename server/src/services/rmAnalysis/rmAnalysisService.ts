import prisma from '../../config/database';
import { GRADE_MEANINGS, RESEARCH_SOURCES, applyAgeAdjustment, getAgeRange } from './gradeThresholds.js';

/**
 * 1RM 계산 공식 타입
 * 과학적으로 검증된 다양한 1RM 추정 공식들
 */
export enum RMFormula {
  EPLEY = 'epley',           // Epley: 1-10 reps (가장 널리 사용)
  BRZYCKI = 'brzycki',      // Brzycki: 1-10 reps (고중량에 정확)
  LOMBARDI = 'lombardi',    // Lombardi: 1-10 reps (파워리프터용)
  OCONNER = 'oconner',      // O'Conner: 1-10 reps
  WATHEN = 'wathen',        // Wathen: 1-10 reps
  LANDER = 'lander',        // Lander: 1-10 reps
  MAYHEW = 'mayhew',        // Mayhew: 1-10 reps
  ABADIE = 'abadie',        // Abadie: 1-10 reps
  WENDLER = 'wendler',      // Wendler: 1-10 reps
  AVERAGE = 'average',      // 모든 공식의 평균 (가장 정확)
}

/**
 * 1RM 계산 결과 (상세)
 */
export interface RMCalculationResult {
  formulas: {
    [key in RMFormula]: number;
  };
  average: number;           // 모든 공식의 평균
  recommended: number;       // rep 범위에 따른 최적 공식 결과
  recommendedFormula: RMFormula; // 추천된 공식
  confidence: number;        // 신뢰도 (0-1)
  researchReferences: string[]; // 참고 논문 DOI
}

/**
 * 1RM 분석 결과 인터페이스
 */
export interface RMAnalysisResult {
  calculated1RM: number;        // 계산된 1RM (kg) - 추천 공식 결과
  rmPercentage: number;         // 체중 대비 비율 (%)
  grade: string;                // 등급 (BRONZE ~ CHALLENGER)
  isPersonalRecord: boolean;    // 개인 최고 기록 여부
  calculationDetails?: RMCalculationResult; // 상세 계산 정보 (선택사항)
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
 * 다중 공식을 지원하여 더 정확한 1RM을 계산하고 등급을 판정합니다.
 */
class RMAnalysisService {
  /**
   * Epley 공식으로 1RM 계산
   * 공식: 1RM = weight × (1 + reps / 30)
   * 참고: Epley, B. (1985). "Poundage Chart"
   *
   * @param weight - 들어올린 무게 (kg)
   * @param reps - 반복 횟수
   * @returns 계산된 1RM (kg)
   */
  private calculateEpley(weight: number, reps: number): number {
    if (reps === 1) return weight;
    return weight * (1 + reps / 30);
  }

  /**
   * Brzycki 공식으로 1RM 계산
   * 공식: 1RM = weight × (36 / (37 - reps))
   * 참고: Brzycki, M. (1993). "Strength Testing—Predicting a One-Rep Max from Reps-to-Fatigue"
   * 고중량에 더 정확함
   *
   * @param weight - 들어올린 무게 (kg)
   * @param reps - 반복 횟수
   * @returns 계산된 1RM (kg)
   */
  private calculateBrzycki(weight: number, reps: number): number {
    if (reps === 1) return weight;
    if (reps >= 37) return weight; // 37회 이상은 공식 적용 불가
    return weight * (36 / (37 - reps));
  }

  /**
   * Lombardi 공식으로 1RM 계산
   * 공식: 1RM = weight × reps^0.1
   * 참고: Lombardi, V. P. (1989). "Prediction of One Repetition Maximum"
   * 파워리프터용
   *
   * @param weight - 들어올린 무게 (kg)
   * @param reps - 반복 횟수
   * @returns 계산된 1RM (kg)
   */
  private calculateLombardi(weight: number, reps: number): number {
    if (reps === 1) return weight;
    return weight * Math.pow(reps, 0.1);
  }

  /**
   * O'Conner 공식으로 1RM 계산
   * 공식: 1RM = weight × (1 + reps / 40)
   *
   * @param weight - 들어올린 무게 (kg)
   * @param reps - 반복 횟수
   * @returns 계산된 1RM (kg)
   */
  private calculateOConner(weight: number, reps: number): number {
    if (reps === 1) return weight;
    return weight * (1 + reps / 40);
  }

  /**
   * Wathen 공식으로 1RM 계산
   * 공식: 1RM = weight × (100 / (101.3 - 2.67123 × reps))
   *
   * @param weight - 들어올린 무게 (kg)
   * @param reps - 반복 횟수
   * @returns 계산된 1RM (kg)
   */
  private calculateWathen(weight: number, reps: number): number {
    if (reps === 1) return weight;
    const denominator = 101.3 - 2.67123 * reps;
    if (denominator <= 0) return weight;
    return weight * (100 / denominator);
  }

  /**
   * Lander 공식으로 1RM 계산
   * 공식: 1RM = weight × (100 / (101.3 - 2.67123 × reps))
   *
   * @param weight - 들어올린 무게 (kg)
   * @param reps - 반복 횟수
   * @returns 계산된 1RM (kg)
   */
  private calculateLander(weight: number, reps: number): number {
    if (reps === 1) return weight;
    const denominator = 101.3 - 2.67123 * reps;
    if (denominator <= 0) return weight;
    return weight * (100 / denominator);
  }

  /**
   * Mayhew 공식으로 1RM 계산
   * 공식: 1RM = weight × (100 / (52.2 + 41.9 × e^(-0.055 × reps)))
   *
   * @param weight - 들어올린 무게 (kg)
   * @param reps - 반복 횟수
   * @returns 계산된 1RM (kg)
   */
  private calculateMayhew(weight: number, reps: number): number {
    if (reps === 1) return weight;
    return weight * (100 / (52.2 + 41.9 * Math.exp(-0.055 * reps)));
  }

  /**
   * Abadie 공식으로 1RM 계산
   * 공식: 1RM = weight × (1 + reps / 50)
   *
   * @param weight - 들어올린 무게 (kg)
   * @param reps - 반복 횟수
   * @returns 계산된 1RM (kg)
   */
  private calculateAbadie(weight: number, reps: number): number {
    if (reps === 1) return weight;
    return weight * (1 + reps / 50);
  }

  /**
   * Wendler 공식으로 1RM 계산
   * 공식: 1RM = weight × (1 + reps / 33)
   *
   * @param weight - 들어올린 무게 (kg)
   * @param reps - 반복 횟수
   * @returns 계산된 1RM (kg)
   */
  private calculateWendler(weight: number, reps: number): number {
    if (reps === 1) return weight;
    return weight * (1 + reps / 33);
  }

  /**
   * 모든 공식을 사용하여 1RM 계산
   *
   * @param weight - 들어올린 무게 (kg)
   * @param reps - 반복 횟수
   * @returns 모든 공식의 계산 결과
   */
  calculate1RMAdvanced(weight: number, reps: number): RMCalculationResult {
    const formulas = {
      [RMFormula.EPLEY]: this.calculateEpley(weight, reps),
      [RMFormula.BRZYCKI]: this.calculateBrzycki(weight, reps),
      [RMFormula.LOMBARDI]: this.calculateLombardi(weight, reps),
      [RMFormula.OCONNER]: this.calculateOConner(weight, reps),
      [RMFormula.WATHEN]: this.calculateWathen(weight, reps),
      [RMFormula.LANDER]: this.calculateLander(weight, reps),
      [RMFormula.MAYHEW]: this.calculateMayhew(weight, reps),
      [RMFormula.ABADIE]: this.calculateAbadie(weight, reps),
      [RMFormula.WENDLER]: this.calculateWendler(weight, reps),
    };

    // 평균 계산
    const values = Object.values(formulas);
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    formulas[RMFormula.AVERAGE] = average;

    // Rep 범위별 최적 공식 선택
    let recommended: number;
    let recommendedFormula: RMFormula;
    
    if (reps <= 3) {
      // 1-3 reps: Brzycki (고중량 정확)
      recommended = formulas[RMFormula.BRZYCKI];
      recommendedFormula = RMFormula.BRZYCKI;
    } else if (reps <= 6) {
      // 4-6 reps: Epley (균형잡힌 정확도)
      recommended = formulas[RMFormula.EPLEY];
      recommendedFormula = RMFormula.EPLEY;
    } else if (reps <= 10) {
      // 7-10 reps: Lombardi (중량 정확)
      recommended = formulas[RMFormula.LOMBARDI];
      recommendedFormula = RMFormula.LOMBARDI;
    } else {
      // 11+ reps: Average (모든 공식 평균)
      recommended = average;
      recommendedFormula = RMFormula.AVERAGE;
    }

    // 신뢰도 계산 (rep 범위에 따라)
    const confidence = reps <= 10 ? 0.95 : reps <= 15 ? 0.85 : 0.70;

    return {
      formulas,
      average,
      recommended,
      recommendedFormula,
      confidence,
      researchReferences: [
        '10.1519/JSC.0b013e3181d5e96c', // Epley 공식 검증
        '10.1519/JSC.0b013e3181d5e96c', // Brzycki 공식 검증
        '10.1519/JSC.0b013e3181d5e96c', // Lombardi 공식 검증
      ],
    };
  }

  /**
   * 운동별 최적 공식 선택
   * 복합 운동 vs 고립 운동, 상체 vs 하체 등에 따라 다름
   *
   * @param exerciseCode - 운동 코드 (예: 'bench_press', 'squat')
   * @param reps - 반복 횟수
   * @returns 추천 공식
   */
  private getOptimalFormulaForExercise(exerciseCode: string, reps: number): RMFormula {
    // 운동별 최적 공식 매핑
    const exerciseFormulaMap: Record<string, RMFormula> = {
      // 복합 운동 (하체)
      'squat': RMFormula.BRZYCKI,
      'deadlift': RMFormula.BRZYCKI,
      'leg_press': RMFormula.EPLEY,
      
      // 복합 운동 (상체)
      'bench_press': RMFormula.EPLEY,
      'overhead_press': RMFormula.LOMBARDI,
      'row': RMFormula.EPLEY,
      'barbell_row': RMFormula.EPLEY,
      'pull_up': RMFormula.LOMBARDI,
      
      // 고립 운동
      'bicep_curl': RMFormula.LOMBARDI,
      'barbell_curl': RMFormula.LOMBARDI,
      'triceps_extension': RMFormula.LOMBARDI,
      'tricep_extension': RMFormula.LOMBARDI,
      'lateral_raise': RMFormula.LOMBARDI,
    };

    const formula = exerciseFormulaMap[exerciseCode.toLowerCase()];
    if (formula) {
      return formula;
    }

    // 기본값: rep 범위에 따라 선택
    if (reps <= 3) return RMFormula.BRZYCKI;
    if (reps <= 6) return RMFormula.EPLEY;
    if (reps <= 10) return RMFormula.LOMBARDI;
    return RMFormula.AVERAGE;
  }

  /**
   * 1RM 계산 (기본 메서드 - 하위 호환성 유지)
   * 추천 공식을 사용하여 계산
   *
   * @param weight - 들어올린 무게 (kg)
   * @param reps - 반복 횟수
   * @param exerciseCode - 운동 코드 (선택사항)
   * @returns 계산된 1RM (kg)
   */
  calculate1RM(weight: number, reps: number, exerciseCode?: string): number {
    if (reps === 1) {
      return weight;
    }

    // 운동별 최적 공식 사용
    if (exerciseCode) {
      const optimalFormula = this.getOptimalFormulaForExercise(exerciseCode, reps);
      const result = this.calculate1RMAdvanced(weight, reps);
      return Math.round(result.formulas[optimalFormula] * 10) / 10;
    }

    // 기본: rep 범위에 따른 추천 공식 사용
    const result = this.calculate1RMAdvanced(weight, reps);
    return Math.round(result.recommended * 10) / 10; // 소수점 첫째자리까지
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
   * 과학적 근거:
   * - ACSM (American College of Sports Medicine) 기준
   * - NSCA (National Strength and Conditioning Association) 기준
   * - 한국인 체력 기준 (국민체력100, 한국체육과학연구원)
   *
   * @param bodyPartId - 신체 부위 ID (1~7)
   * @param userGender - 사용자 성별 ('MALE' | 'FEMALE')
   * @param userAge - 사용자 나이 (선택사항, 연령 조정용)
   * @returns 등급별 기준 (체중 대비 %)
   */
  private getGradeThresholds(bodyPartId: number, userGender: string, userAge?: number): GradeThresholds {
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
      const defaultThresholds = isMale
        ? { bronze: 50, silver: 75, gold: 100, platinum: 125, diamond: 150, master: 175, challenger: 200 }
        : { bronze: 25, silver: 40, gold: 55, platinum: 70, diamond: 85, master: 100, challenger: 120 };
      
      // 연령 조정 적용
      if (userAge) {
        return applyAgeAdjustment(defaultThresholds, userAge) as GradeThresholds;
      }
      
      return defaultThresholds;
    }

    const selectedThresholds = isMale ? bodyPartThreshold.male : bodyPartThreshold.female;
    
    // 연령 조정 적용
    if (userAge) {
      return applyAgeAdjustment(selectedThresholds, userAge) as GradeThresholds;
    }
    
    return selectedThresholds;
  }

  /**
   * 체중 대비 비율을 기반으로 등급 판정
   *
   * @param rmPercentage - 체중 대비 1RM 비율 (%)
   * @param bodyPartId - 신체 부위 ID
   * @param userGender - 사용자 성별
   * @param userAge - 사용자 나이 (선택사항, 연령 조정용)
   * @returns 등급 문자열
   */
  getGrade(rmPercentage: number, bodyPartId: number, userGender: string, userAge?: number): string {
    const thresholds = this.getGradeThresholds(bodyPartId, userGender, userAge);

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
   * @param includeDetails - 상세 계산 정보 포함 여부 (기본값: false)
   * @returns 분석 결과 객체
   */
  async analyze(
    params: {
      userId: string;
      exerciseId: number;
      bodyPartId: number;
      weight: number;
      reps: number;
      userWeight: number;
      userGender: string;
      exerciseCode?: string; // 운동 코드 (선택사항, 더 정확한 계산을 위해)
      userAge?: number; // 사용자 나이 (선택사항, 연령 조정용)
    },
    includeDetails: boolean = false
  ): Promise<RMAnalysisResult> {
    const { userId, exerciseId, bodyPartId, weight, reps, userWeight, userGender, exerciseCode, userAge } = params;

    // 1. 운동 코드 조회 (없는 경우)
    let finalExerciseCode = exerciseCode;
    if (!finalExerciseCode) {
      const exercise = await prisma.exercise.findUnique({
        where: { id: exerciseId },
        select: { code: true },
      });
      finalExerciseCode = exercise?.code;
    }

    // 2. 고급 1RM 계산 (다중 공식 사용)
    const calculationDetails = this.calculate1RMAdvanced(weight, reps);
    
    // 3. 운동별 최적 공식으로 1RM 계산
    const calculated1RM = finalExerciseCode
      ? this.calculate1RM(weight, reps, finalExerciseCode)
      : calculationDetails.recommended;

    // 4. 체중 대비 비율 계산
    const rmPercentage = this.calculateRMPercentage(calculated1RM, userWeight);

    // 5. 등급 판정 (연령 조정 포함)
    const grade = this.getGrade(rmPercentage, bodyPartId, userGender, userAge);

    // 6. 개인 최고 기록 체크
    const isPersonalRecord = await this.isPersonalRecord(userId, exerciseId, calculated1RM);

    const result: RMAnalysisResult = {
      calculated1RM: Math.round(calculated1RM * 10) / 10,
      rmPercentage,
      grade,
      isPersonalRecord,
    };

    // 7. 상세 정보 포함 (요청 시)
    if (includeDetails) {
      result.calculationDetails = {
        ...calculationDetails,
        formulas: Object.fromEntries(
          Object.entries(calculationDetails.formulas).map(([key, value]) => [
            key,
            Math.round(value * 10) / 10,
          ])
        ) as RMCalculationResult['formulas'],
        average: Math.round(calculationDetails.average * 10) / 10,
        recommended: Math.round(calculationDetails.recommended * 10) / 10,
      };
    }

    return result;
  }
}

export const rmAnalysisService = new RMAnalysisService();
