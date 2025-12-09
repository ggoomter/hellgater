/**
 * 개인화된 칼로리 계산 서비스
 * 
 * 과학적 근거:
 * - ACSM METs (Metabolic Equivalent of Task) 기준
 * - 개인 정보를 반영한 정확한 칼로리 계산
 * - 웨어러블 디바이스 연동 지원
 */

/**
 * 개인화된 칼로리 계산 파라미터
 */
export interface PersonalizedCalorieParams {
  // 기본 정보
  userWeight: number;        // kg
  userHeight?: number;        // cm
  userAge?: number;           // years
  userGender?: string;        // 'MALE' | 'FEMALE'
  
  // 체력 수준
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  restingHeartRate?: number;  // 안정시 심박수 (bpm)
  
  // 운동 정보
  exerciseType: string;       // 운동 코드
  exerciseIntensity?: number; // 1-10 (RPE - Rate of Perceived Exertion)
  duration?: number;           // 분 (운동 시간)
  sets: number;
  reps: number;
  weight: number;
  restTime?: number;          // 세트 간 휴식 시간 (초)
}

/**
 * 심박수 기반 칼로리 계산 파라미터
 */
export interface HeartRateBasedCalorieParams {
  averageHeartRate: number;   // 평균 심박수 (bpm)
  maxHeartRate: number;         // 최대 심박수 (bpm)
  restingHeartRate: number;     // 안정시 심박수 (bpm)
  duration: number;           // 분
  userWeight: number;         // kg
  userAge: number;            // years
}

/**
 * 칼로리 계산 결과
 */
export interface CalorieCalculationResult {
  totalCalories: number;       // 총 소모 칼로리 (kcal)
  activeCalories: number;      // 운동 중 소모 칼로리 (kcal)
  restCalories: number;         // 휴식 중 소모 칼로리 (kcal)
  epocCalories: number;         // EPOC (운동 후 과소비산소) 칼로리 (kcal)
  method: 'basic' | 'personalized' | 'heart_rate'; // 사용된 계산 방법
  confidence: number;          // 신뢰도 (0-1)
}

/**
 * 개인화된 칼로리 계산 서비스
 */
class CalorieCalculationService {
  /**
   * 운동별 METs 값 (ACSM 기준)
   * METs = Metabolic Equivalent of Task
   * 1 MET = 안정시 대사율 (약 3.5 ml O2/kg/min)
   */
  private getExerciseMETs(exerciseCode: string): number {
    const METsMap: Record<string, number> = {
      // 복합 운동 (하체)
      'squat': 5.0,
      'deadlift': 6.0,
      'leg_press': 5.5,
      'lunge': 4.5,
      
      // 복합 운동 (상체)
      'bench_press': 3.0,
      'overhead_press': 3.5,
      'row': 4.0,
      'barbell_row': 4.0,
      'pull_up': 8.0,
      
      // 고립 운동
      'bicep_curl': 2.5,
      'barbell_curl': 2.5,
      'triceps_extension': 2.5,
      'tricep_extension': 2.5,
      'lateral_raise': 2.0,
      
      // 맨몸 운동
      'push_up': 3.8,
      'sit_up': 3.0,
      'plank': 3.0,
      
      // 유산소
      'running': 8.0,
      'cycling': 6.0,
      'swimming': 7.0,
    };
    
    return METsMap[exerciseCode.toLowerCase()] || 3.0; // 기본값
  }

  /**
   * 기본 칼로리 계산 (기존 방식)
   * 공식: reps × weight × caloriePerRepKg
   *
   * @param sets - 세트 수
   * @param reps - 반복 횟수
   * @param weight - 무게 (kg)
   * @param caloriePerRepKg - 운동별 칼로리 계수
   * @returns 소모 칼로리 (kcal)
   */
  calculateBasic(
    sets: number,
    reps: number,
    weight: number,
    caloriePerRepKg: number
  ): number {
    const totalReps = sets * reps;
    const calories = totalReps * weight * caloriePerRepKg;
    return Math.round(calories * 10) / 10; // 소수점 첫째자리
  }

  /**
   * 개인화된 칼로리 계산
   * 공식: METs × 체중(kg) × 시간(시간) × 3.5 / 200
   * 
   * 참고: ACSM 칼로리 계산 공식
   *
   * @param params - 개인화 파라미터
   * @returns 칼로리 계산 결과
   */
  calculatePersonalized(params: PersonalizedCalorieParams): CalorieCalculationResult {
    const {
      userWeight,
      exerciseType,
      exerciseIntensity = 5,
      duration,
      sets,
      reps,
      weight,
      restTime = 60, // 기본 60초 휴식
      fitnessLevel = 'intermediate',
    } = params;

    // 1. 운동별 기본 METs 값
    const baseMETs = this.getExerciseMETs(exerciseType);

    // 2. 강도에 따른 METs 조정
    // RPE 1-10을 METs 배율로 변환 (1.0 ~ 1.5)
    const intensityMultiplier = 1 + (exerciseIntensity - 5) * 0.1;
    const adjustedMETs = baseMETs * intensityMultiplier;

    // 3. 무게에 따른 추가 에너지 소비
    // 무게가 체중의 일정 비율 이상이면 추가 에너지 소비
    const weightRatio = weight / userWeight;
    const weightFactor = 1 + Math.min(weightRatio * 0.1, 0.3); // 최대 30% 증가

    // 4. 운동 시간 계산
    // duration이 없으면 세트 수와 휴식 시간으로 추정
    const estimatedDuration = duration || (sets * 2 + (sets - 1) * restTime / 60); // 분
    const activeTime = duration || (sets * 2); // 실제 운동 시간 (분)
    const restTimeMinutes = (restTime * sets) / 60; // 총 휴식 시간 (분)

    // 5. 운동 중 칼로리 계산
    // 공식: METs × 체중(kg) × 시간(시간) × 3.5 / 200
    const activeCalories = adjustedMETs * userWeight * (activeTime / 60) * 3.5 / 200;

    // 6. 휴식 중 칼로리 계산 (기본 대사율: 1.0 METs)
    const restCalories = 1.0 * userWeight * (restTimeMinutes / 60) * 3.5 / 200;

    // 7. EPOC (Exercise Post-Exercise Oxygen Consumption) 계산
    // 운동 강도에 따라 운동 후 5-15% 추가 칼로리 소비
    const epocFactor = 1 + (exerciseIntensity / 10) * 0.15;
    const epocCalories = activeCalories * (epocFactor - 1);

    // 8. 총 칼로리 계산
    const totalCalories = (activeCalories + restCalories + epocCalories) * weightFactor;

    // 9. 신뢰도 계산
    const confidence = duration ? 0.9 : 0.7; // duration이 있으면 더 정확

    return {
      totalCalories: Math.round(totalCalories * 10) / 10,
      activeCalories: Math.round(activeCalories * 10) / 10,
      restCalories: Math.round(restCalories * 10) / 10,
      epocCalories: Math.round(epocCalories * 10) / 10,
      method: 'personalized',
      confidence,
    };
  }

  /**
   * 심박수 기반 칼로리 계산 (가장 정확)
   * 공식: (0.6309 × HR + 0.1988 × W + 0.2017 × A - 55.0969) × T / 4.184
   * HR: 평균 심박수, W: 체중(kg), A: 나이, T: 시간(분)
   * 
   * 참고: Katch-McArdle 공식
   *
   * @param params - 심박수 기반 파라미터
   * @returns 칼로리 계산 결과
   */
  calculateHeartRateBased(params: HeartRateBasedCalorieParams): CalorieCalculationResult {
    const { averageHeartRate, userWeight, userAge, duration } = params;

    // Katch-McArdle 공식
    const caloriesPerMinute = 
      (0.6309 * averageHeartRate + 0.1988 * userWeight + 0.2017 * userAge - 55.0969) / 4.184;

    const totalCalories = caloriesPerMinute * duration;

    return {
      totalCalories: Math.round(totalCalories * 10) / 10,
      activeCalories: Math.round(totalCalories * 10) / 10,
      restCalories: 0,
      epocCalories: 0,
      method: 'heart_rate',
      confidence: 0.95, // 심박수 기반은 가장 정확
    };
  }

  /**
   * 통합 칼로리 계산
   * 사용 가능한 정보에 따라 최적의 방법 선택
   *
   * @param params - 칼로리 계산 파라미터
   * @param heartRateData - 심박수 데이터 (선택사항)
   * @returns 칼로리 계산 결과
   */
  calculate(
    params: PersonalizedCalorieParams,
    heartRateData?: HeartRateBasedCalorieParams
  ): CalorieCalculationResult {
    // 심박수 데이터가 있으면 가장 정확한 방법 사용
    if (heartRateData) {
      return this.calculateHeartRateBased(heartRateData);
    }

    // 개인 정보가 충분하면 개인화된 계산
    if (params.userWeight && params.exerciseType) {
      return this.calculatePersonalized(params);
    }

    // 기본 계산 (하위 호환성)
    const caloriePerRepKg = 0.05; // 기본값
    const totalCalories = this.calculateBasic(
      params.sets,
      params.reps,
      params.weight,
      caloriePerRepKg
    );

    return {
      totalCalories,
      activeCalories: totalCalories,
      restCalories: 0,
      epocCalories: 0,
      method: 'basic',
      confidence: 0.5,
    };
  }
}

export const calorieCalculationService = new CalorieCalculationService();

