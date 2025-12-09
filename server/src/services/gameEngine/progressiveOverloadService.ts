/**
 * 프로그레시브 오버로드 자동 추천 서비스
 * 
 * 과학적 원칙 기반 프로그레시브 오버로드 추천
 * 참고: NSCA 프로그레시브 오버로드 원칙
 */

import prisma from '../../config/database.js';

/**
 * 현재 운동 정보
 */
export interface CurrentWorkout {
  exerciseId: number;
  sets: number;
  reps: number;
  weight: number;
  rpe?: number;              // Rate of Perceived Exertion (1-10)
}

/**
 * 프로그레시브 오버로드 추천 결과
 */
export interface ProgressiveOverloadRecommendation {
  currentWorkout: CurrentWorkout;
  
  recommendation: {
    nextWeight: number;       // 다음 운동 시 추천 무게
    nextReps: number;          // 다음 운동 시 추천 횟수
    nextSets: number;          // 다음 운동 시 추천 세트 수
    
    reason: string;            // 추천 이유
    progressionType: 'weight' | 'reps' | 'sets' | 'intensity' | 'maintain';
    
    // 과학적 근거
    researchBasis: {
      principle: string;       // '2.5% rule', 'double progression' 등
      source: string;          // 연구 출처
    };
  };
  
  warnings: string[];         // 주의사항 (예: 너무 빠른 진행)
  expectedRPE?: number;      // 예상 RPE
}

/**
 * 최근 운동 기록 분석 결과
 */
interface ProgressionAnalysis {
  trend: 'increasing' | 'stable' | 'decreasing';
  averageRPE: number;
  successRate: number;        // 목표 횟수 달성률
  weeklyIncrease: number;     // 주간 증가율 (%)
  volumeTrend: 'increasing' | 'stable' | 'decreasing';
}

/**
 * 프로그레시브 오버로드 추천 서비스
 */
class ProgressiveOverloadService {
  /**
   * 최근 운동 기록 분석
   *
   * @param userId - 사용자 ID
   * @param exerciseId - 운동 종목 ID
   * @param weeks - 분석할 주 수 (기본값: 4)
   * @returns 진행 패턴 분석 결과
   */
  private async analyzeProgression(
    userId: string,
    exerciseId: number,
    weeks: number = 4
  ): Promise<ProgressionAnalysis> {
    const weeksAgo = new Date();
    weeksAgo.setDate(weeksAgo.getDate() - weeks * 7);

    // 최근 운동 기록 조회
    const recentWorkouts = await prisma.workoutRecord.findMany({
      where: {
        userId,
        exerciseId,
        workoutDate: {
          gte: weeksAgo,
        },
      },
      orderBy: {
        workoutDate: 'asc',
      },
    });

    if (recentWorkouts.length === 0) {
      return {
        trend: 'stable',
        averageRPE: 7,
        successRate: 0.8,
        weeklyIncrease: 0,
        volumeTrend: 'stable',
      };
    }

    // 볼륨 트렌드 분석
    const volumes = recentWorkouts.map(w => w.sets * w.reps * Number(w.weight));
    const volumeTrend = this.calculateTrend(volumes);

    // 무게 트렌드 분석
    const weights = recentWorkouts.map(w => Number(w.weight));
    const weightTrend = this.calculateTrend(weights);

    // 주간 증가율 계산
    const firstWeight = weights[0];
    const lastWeight = weights[weights.length - 1];
    const weeklyIncrease = firstWeight > 0 
      ? ((lastWeight - firstWeight) / firstWeight) / weeks 
      : 0;

    // 성공률 계산 (목표 횟수 달성 여부는 RPE로 추정)
    // RPE가 낮으면 성공, 높으면 실패로 간주
    const averageRPE = 7; // 기본값 (실제로는 사용자 입력 필요)
    const successRate = averageRPE <= 7 ? 0.9 : averageRPE <= 8 ? 0.7 : 0.5;

    return {
      trend: weightTrend,
      averageRPE,
      successRate,
      weeklyIncrease,
      volumeTrend,
    };
  }

  /**
   * 트렌드 계산
   */
  private calculateTrend(values: number[]): 'increasing' | 'stable' | 'decreasing' {
    if (values.length < 2) return 'stable';

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const change = (secondAvg - firstAvg) / firstAvg;

    if (change > 0.05) return 'increasing';
    if (change < -0.05) return 'decreasing';
    return 'stable';
  }

  /**
   * RPE 추정 (실제 측정값이 없을 때)
   * 무게, 횟수, 세트 수를 기반으로 추정
   */
  private estimateRPE(
    weight: number,
    reps: number,
    sets: number,
    recentMaxWeight?: number
  ): number {
    // 최근 최대 무게 대비 현재 무게 비율
    if (recentMaxWeight && recentMaxWeight > 0) {
      const weightRatio = weight / recentMaxWeight;
      if (weightRatio >= 0.95) return 9; // 최대 무게 근처
      if (weightRatio >= 0.90) return 8;
      if (weightRatio >= 0.85) return 7;
      if (weightRatio >= 0.80) return 6;
      return 5;
    }

    // 횟수 기반 추정
    if (reps >= 12) return 6; // 높은 횟수 = 낮은 RPE
    if (reps >= 8) return 7;
    if (reps >= 5) return 8;
    return 9; // 낮은 횟수 = 높은 RPE
  }

  /**
   * 프로그레시브 오버로드 추천 생성
   *
   * @param userId - 사용자 ID
   * @param currentWorkout - 현재 운동 정보
   * @returns 추천 결과
   */
  async recommend(
    userId: string,
    currentWorkout: CurrentWorkout
  ): Promise<ProgressiveOverloadRecommendation> {
    const { exerciseId, sets, reps, weight, rpe } = currentWorkout;

    // 1. 최근 운동 기록 분석
    const progression = await this.analyzeProgression(userId, exerciseId, 4);

    // 2. RPE 결정 (입력값 또는 추정값)
    const currentRPE = rpe || this.estimateRPE(weight, reps, sets);

    // 3. 최근 최대 무게 조회
    const recentMaxRecord = await prisma.workoutRecord.findFirst({
      where: {
        userId,
        exerciseId,
      },
      orderBy: {
        weight: 'desc',
      },
    });
    const recentMaxWeight = recentMaxRecord ? Number(recentMaxRecord.weight) : weight;

    // 4. 추천 로직
    let recommendation: ProgressiveOverloadRecommendation['recommendation'];
    const warnings: string[] = [];

    if (currentRPE <= 7 && reps >= 12) {
      // 쉬웠고 횟수가 많음 → 무게 증가, 횟수 감소
      recommendation = {
        nextWeight: weight * 1.025, // 2.5% 증가
        nextReps: Math.max(8, reps - 2),
        nextSets: sets,
        reason: 'RPE가 낮고 횟수가 많아 무게를 증가시키고 횟수를 줄이는 것을 추천합니다.',
        progressionType: 'weight',
        researchBasis: {
          principle: '2.5% Rule (NSCA)',
          source: 'NSCA Essentials of Strength Training and Conditioning',
        },
      };
    } else if (currentRPE <= 7 && reps < 12) {
      // 쉬웠고 횟수가 적절함 → 횟수 증가
      recommendation = {
        nextWeight: weight,
        nextReps: reps + 1,
        nextSets: sets,
        reason: 'RPE가 낮아 횟수를 증가시키는 것을 추천합니다.',
        progressionType: 'reps',
        researchBasis: {
          principle: 'Double Progression',
          source: 'NSCA Essentials of Strength Training and Conditioning',
        },
      };
    } else if (currentRPE >= 9) {
      // 매우 어려움 → 유지 또는 감소
      recommendation = {
        nextWeight: weight,
        nextReps: reps,
        nextSets: sets,
        reason: 'RPE가 매우 높아 현재 강도를 유지하는 것을 추천합니다.',
        progressionType: 'maintain',
        researchBasis: {
          principle: 'RPE-based Progression',
          source: 'RPE Scale Research',
        },
      };
      warnings.push('현재 강도가 매우 높습니다. 부상 위험이 있으니 주의하세요.');
    } else {
      // 적절함 → 점진적 증가
      const increaseRate = progression.weeklyIncrease > 0.05 ? 0.01 : 0.02; // 주간 증가율이 높으면 더 작게 증가
      recommendation = {
        nextWeight: weight * (1 + increaseRate), // 1-2% 증가
        nextReps: reps,
        nextSets: sets,
        reason: 'RPE가 적절하여 점진적으로 무게를 증가시키는 것을 추천합니다.',
        progressionType: 'weight',
        researchBasis: {
          principle: 'Linear Progression',
          source: 'NSCA Essentials of Strength Training and Conditioning',
        },
      };
    }

    // 5. 경고사항 체크
    if (progression.weeklyIncrease > 0.05) {
      warnings.push('주간 증가율이 5%를 초과합니다. 부상 위험이 있으니 주의하세요.');
    }
    if (sets * reps > 25) {
      warnings.push('세트×횟수가 25를 초과합니다. 과로 주의가 필요합니다.');
    }
    if (recommendation.nextWeight > recentMaxWeight * 1.1) {
      warnings.push('추천 무게가 최근 최대 무게보다 10% 이상 높습니다. 점진적으로 진행하세요.');
    }

    // 6. 예상 RPE 계산
    const weightRatio = recommendation.nextWeight / weight;
    const expectedRPE = currentRPE + (weightRatio - 1) * 5; // 무게 증가에 따른 RPE 증가 추정
    recommendation.expectedRPE = Math.min(10, Math.max(1, Math.round(expectedRPE)));

    return {
      currentWorkout,
      recommendation: {
        ...recommendation,
        nextWeight: Math.round(recommendation.nextWeight * 10) / 10,
      },
      warnings,
      expectedRPE: recommendation.expectedRPE,
    };
  }

  /**
   * 다음 운동 추천 조회 (API용)
   *
   * @param userId - 사용자 ID
   * @param exerciseId - 운동 종목 ID
   * @returns 추천 결과
   */
  async getNextWorkoutRecommendation(
    userId: string,
    exerciseId: number
  ): Promise<ProgressiveOverloadRecommendation | null> {
    // 최근 운동 기록 조회
    const lastWorkout = await prisma.workoutRecord.findFirst({
      where: {
        userId,
        exerciseId,
      },
      orderBy: {
        workoutDate: 'desc',
      },
    });

    if (!lastWorkout) {
      return null; // 첫 운동이면 추천 불가
    }

    return this.recommend(userId, {
      exerciseId,
      sets: lastWorkout.sets,
      reps: lastWorkout.reps,
      weight: Number(lastWorkout.weight),
    });
  }
}

export const progressiveOverloadService = new ProgressiveOverloadService();

