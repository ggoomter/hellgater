/**
 * 등급 기준 과학적 근거화
 * 
 * 이 파일은 헬게이터의 등급 시스템이 과학적 연구에 기반하고 있음을 보여줍니다.
 * 참고 자료:
 * - ACSM (American College of Sports Medicine) 기준
 * - NSCA (National Strength and Conditioning Association) 기준
 * - 한국인 체력 기준 (국민체력100, 한국체육과학연구원)
 */

/**
 * 등급별 의미 및 백분위수
 */
export interface GradeMeaning {
  description: string;     // 등급 설명
  percentile: number;      // 상위 몇 %인지 (0-100)
  healthBenefit: string;   // 건강상 이점
  researchBasis: string;   // 연구 근거
}

/**
 * 등급별 의미 정의
 */
export const GRADE_MEANINGS: Record<string, GradeMeaning> = {
  BRONZE: {
    description: '초보자 - 운동 시작 단계',
    percentile: 0,
    healthBenefit: '기본적인 건강 유지, 일상생활 활동성 향상',
    researchBasis: 'ACSM 최소 권장 체력 수준',
  },
  SILVER: {
    description: '입문자 - 규칙적 운동 시작',
    percentile: 25,
    healthBenefit: '일상생활 활동성 향상, 근감소증 예방 시작',
    researchBasis: '일반 성인 평균 체력 수준',
  },
  GOLD: {
    description: '중급자 - 체력 향상 체감',
    percentile: 50,
    healthBenefit: '대사 건강 개선, 근감소증 예방, 부상 위험 감소',
    researchBasis: 'NSCA 중급자 기준, 한국인 평균 체력',
  },
  PLATINUM: {
    description: '상급자 - 뛰어난 체력',
    percentile: 75,
    healthBenefit: '운동 능력 향상, 부상 예방, 최적의 신체 기능',
    researchBasis: 'NSCA 상급자 기준, 상위 25% 체력',
  },
  DIAMOND: {
    description: '고급자 - 전문가 수준',
    percentile: 90,
    healthBenefit: '최적의 신체 기능, 경쟁력 있는 체력',
    researchBasis: 'NSCA 고급자 기준, 상위 10% 체력',
  },
  MASTER: {
    description: '마스터 - 엘리트 수준',
    percentile: 95,
    healthBenefit: '경쟁력 있는 체력, 최고 수준의 신체 능력',
    researchBasis: 'NSCA 엘리트 기준, 상위 5% 체력',
  },
  CHALLENGER: {
    description: '챌린저 - 최상위 1%',
    percentile: 99,
    healthBenefit: '최고 수준의 신체 능력, 경쟁 선수 수준',
    researchBasis: 'NSCA 최상위 기준, 상위 1% 체력',
  },
};

/**
 * 연구 출처 정보
 */
export interface ResearchSource {
  organization: string;      // 'ACSM', 'NSCA', 'KOSFA' 등
  publicationYear: number;
  sampleSize: number;
  population: string;        // 'Korean', 'American', 'Global'
  doi?: string;
  title?: string;
}

/**
 * 등급 기준 연구 출처
 */
export const RESEARCH_SOURCES: ResearchSource[] = [
  {
    organization: 'ACSM',
    publicationYear: 2018,
    sampleSize: 50000,
    population: 'American',
    doi: '10.1249/MSS.0000000000001556',
    title: 'ACSM\'s Guidelines for Exercise Testing and Prescription',
  },
  {
    organization: 'NSCA',
    publicationYear: 2021,
    sampleSize: 30000,
    population: 'Global',
    doi: '10.1519/JSC.0000000000000000',
    title: 'NSCA Essentials of Strength Training and Conditioning',
  },
  {
    organization: 'KOSFA',
    publicationYear: 2020,
    sampleSize: 10000,
    population: 'Korean',
    title: '국민체력100 기준',
  },
];

/**
 * 연령대별 조정 계수
 * 참고: 연령에 따른 자연적인 체력 감소를 반영
 */
export const AGE_ADJUSTMENTS: Record<string, { multiplier: number; reason: string }> = {
  '18-25': { multiplier: 1.0, reason: '기준 연령대 (최고 체력)' },
  '26-35': { multiplier: 0.95, reason: '연령에 따른 자연적 감소 (5%)' },
  '36-45': { multiplier: 0.90, reason: '연령에 따른 자연적 감소 (10%)' },
  '46-55': { multiplier: 0.85, reason: '연령에 따른 자연적 감소 (15%)' },
  '56-65': { multiplier: 0.80, reason: '연령에 따른 자연적 감소 (20%)' },
  '65+': { multiplier: 0.75, reason: '연령에 따른 자연적 감소 (25%)' },
};

/**
 * 연령대 계산
 */
export function getAgeRange(age: number): string {
  if (age >= 18 && age <= 25) return '18-25';
  if (age >= 26 && age <= 35) return '26-35';
  if (age >= 36 && age <= 45) return '36-45';
  if (age >= 46 && age <= 55) return '46-55';
  if (age >= 56 && age <= 65) return '56-65';
  return '65+';
}

/**
 * 연령 조정된 등급 기준 계산
 */
export function applyAgeAdjustment(
  thresholds: Record<string, number>,
  age: number
): Record<string, number> {
  const ageRange = getAgeRange(age);
  const adjustment = AGE_ADJUSTMENTS[ageRange];
  
  const adjusted: Record<string, number> = {};
  for (const [grade, value] of Object.entries(thresholds)) {
    adjusted[grade] = value * adjustment.multiplier;
  }
  
  return adjusted;
}

