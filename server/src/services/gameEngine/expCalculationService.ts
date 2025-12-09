/**
 * 경험치 계산 결과 인터페이스
 */
export interface ExpCalculationResult {
  totalExp: number;             // 획득 경험치 총합
  breakdown: {
    baseExp: number;            // 기본 경험치
    gradeBonus: number;         // 등급 보너스
    volumeBonus: number;        // 볼륨 보너스 (세트 수 많을 때)
    prBonus: number;            // 개인 기록 보너스
    levelPenalty: number;       // 레벨 페널티 (높은 레벨일수록 감소)
  };
}

/**
 * 경험치 계산 서비스
 * 운동 기록을 기반으로 획득 경험치를 계산합니다.
 * 레벨이 높을수록 같은 운동에서 얻는 경험치가 감소합니다.
 */
class ExpCalculationService {
  /**
   * 기본 경험치 계산
   * 공식: sets × reps × weight × difficultyMultiplier
   *
   * @param sets - 세트 수
   * @param reps - 반복 횟수
   * @param weight - 무게 (kg)
   * @param exerciseDifficulty - 운동 난이도 (1-10)
   * @returns 기본 경험치
   */
  calculateBaseExp(
    sets: number,
    reps: number,
    weight: number,
    exerciseDifficulty: number
  ): number {
    // 운동 볼륨 계산
    const volume = sets * reps * weight;

    // 난이도 배율 (1-10 → 0.1-1.0)
    const difficultyMultiplier = exerciseDifficulty / 10;

    // 기본 경험치 = 볼륨 × 난이도
    const baseExp = volume * difficultyMultiplier;

    return Math.round(baseExp);
  }

  /**
   * 등급 보너스 계산
   * 높은 등급일수록 더 많은 보너스
   *
   * @param grade - 등급 (BRONZE ~ CHALLENGER)
   * @param baseExp - 기본 경험치
   * @returns 등급 보너스
   */
  getGradeBonus(grade: string, baseExp: number): number {
    const bonusRates: Record<string, number> = {
      BRONZE: 0,        // +0%
      SILVER: 0.1,      // +10%
      GOLD: 0.25,       // +25%
      PLATINUM: 0.5,    // +50%
      DIAMOND: 0.75,    // +75%
      MASTER: 1.0,      // +100%
      CHALLENGER: 1.5,  // +150%
    };

    const rate = bonusRates[grade] || 0;
    return Math.round(baseExp * rate);
  }

  /**
   * 볼륨 보너스 계산
   * 많은 세트를 할수록 추가 보너스
   *
   * @param sets - 세트 수
   * @param baseExp - 기본 경험치
   * @returns 볼륨 보너스
   */
  getVolumeBonus(sets: number, baseExp: number): number {
    if (sets >= 10) {
      return Math.round(baseExp * 0.15); // 10세트 이상 +15%
    } else if (sets >= 7) {
      return Math.round(baseExp * 0.1); // 7세트 이상 +10%
    } else if (sets >= 5) {
      return Math.round(baseExp * 0.05); // 5세트 이상 +5%
    }
    return 0;
  }

  /**
   * 개인 기록 보너스 계산
   * PR 달성 시 대폭 증가
   *
   * @param isPersonalRecord - PR 여부
   * @param baseExp - 기본 경험치
   * @returns PR 보너스
   */
  getPRBonus(isPersonalRecord: boolean, baseExp: number): number {
    return isPersonalRecord ? Math.round(baseExp * 0.5) : 0; // PR 시 +50%
  }

  /**
   * 레벨 페널티 계산 (핵심 로직)
   * 레벨이 높을수록 같은 운동에서 얻는 경험치 감소
   *
   * 공식:
   * - Lv.1-5: 페널티 없음 (100%)
   * - Lv.6-10: -10% (90%)
   * - Lv.11-15: -20% (80%)
   * - Lv.16-20: -30% (70%)
   * - Lv.21-25: -40% (60%)
   * - Lv.26-30: -50% (50%)
   * - Lv.31+: -60% (40%)
   *
   * @param currentLevel - 현재 부위 레벨
   * @param totalExp - 총 경험치 (보너스 포함)
   * @returns 레벨 페널티 (음수)
   */
  getLevelPenalty(currentLevel: number, totalExp: number): number {
    let penaltyRate = 0;

    if (currentLevel >= 31) {
      penaltyRate = 0.6; // -60%
    } else if (currentLevel >= 26) {
      penaltyRate = 0.5; // -50%
    } else if (currentLevel >= 21) {
      penaltyRate = 0.4; // -40%
    } else if (currentLevel >= 16) {
      penaltyRate = 0.3; // -30%
    } else if (currentLevel >= 11) {
      penaltyRate = 0.2; // -20%
    } else if (currentLevel >= 6) {
      penaltyRate = 0.1; // -10%
    }
    // Lv.1-5: 페널티 없음

    return -Math.round(totalExp * penaltyRate);
  }

  /**
   * 종합 경험치 계산
   *
   * @param params - 계산 파라미터
   * @returns 경험치 계산 결과
   */
  calculate(params: {
    sets: number;
    reps: number;
    weight: number;
    exerciseDifficulty: number;
    grade: string;
    isPersonalRecord: boolean;
    currentBodyPartLevel: number; // 현재 부위 레벨
  }): ExpCalculationResult {
    const {
      sets,
      reps,
      weight,
      exerciseDifficulty,
      grade,
      isPersonalRecord,
      currentBodyPartLevel,
    } = params;

    // 1. 기본 경험치
    const baseExp = this.calculateBaseExp(sets, reps, weight, exerciseDifficulty);

    // 2. 등급 보너스
    const gradeBonus = this.getGradeBonus(grade, baseExp);

    // 3. 볼륨 보너스
    const volumeBonus = this.getVolumeBonus(sets, baseExp);

    // 4. PR 보너스
    const prBonus = this.getPRBonus(isPersonalRecord, baseExp);

    // 5. 보너스 합계
    const totalBeforePenalty = baseExp + gradeBonus + volumeBonus + prBonus;

    // 6. 레벨 페널티 적용
    const levelPenalty = this.getLevelPenalty(currentBodyPartLevel, totalBeforePenalty);

    // 7. 최종 경험치 (음수 방지)
    const totalExp = Math.max(1, totalBeforePenalty + levelPenalty);

    return {
      totalExp,
      breakdown: {
        baseExp,
        gradeBonus,
        volumeBonus,
        prBonus,
        levelPenalty,
      },
    };
  }

  /**
   * 칼로리 소모량 계산 (기본 방법 - 하위 호환성 유지)
   *
   * @param sets - 세트 수
   * @param reps - 반복 횟수
   * @param weight - 무게 (kg)
   * @param caloriePerRepKg - 운동별 칼로리 계수 (Exercise 테이블)
   * @returns 소모 칼로리 (kcal)
   * 
   * @deprecated 개인화된 칼로리 계산을 위해 calorieCalculationService 사용 권장
   */
  calculateCalories(
    sets: number,
    reps: number,
    weight: number,
    caloriePerRepKg: number
  ): number {
    const totalReps = sets * reps;
    const calories = totalReps * weight * caloriePerRepKg;
    return Math.round(calories * 10) / 10; // 소수점 첫째자리
  }
}

export const expCalculationService = new ExpCalculationService();
