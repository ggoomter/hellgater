// Grades & Tiers Constants

export const GRADES = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum',
  DIAMOND: 'diamond',
  MASTER: 'master',
  CHALLENGER: 'challenger',
} as const;

export type Grade = (typeof GRADES)[keyof typeof GRADES];

export const GRADE_EXP_MULTIPLIER: Record<Grade, number> = {
  bronze: 1.0,
  silver: 1.2,
  gold: 1.5,
  platinum: 2.0,
  diamond: 2.5,
  master: 3.0,
  challenger: 4.0,
};

export const GRADE_COLORS: Record<Grade, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
  diamond: '#B9F2FF',
  master: '#9966FF',
  challenger: '#FF4500',
};

export const GRADE_NAMES_KO: Record<Grade, string> = {
  bronze: '브론즈',
  silver: '실버',
  gold: '골드',
  platinum: '플래티넘',
  diamond: '다이아',
  master: '마스터',
  challenger: '챌린저',
};
