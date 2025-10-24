// Body Parts Constants

export const BODY_PARTS = {
  SHOULDER: 'shoulder',
  CHEST: 'chest',
  BACK: 'back',
  ARM: 'arm',
  ABDOMINAL: 'abdominal',
  HIP: 'hip',
  LEG: 'leg',
} as const;

export type BodyPartCode = (typeof BODY_PARTS)[keyof typeof BODY_PARTS];

export interface BodyPartInfo {
  code: BodyPartCode;
  nameKo: string;
  nameEn: string;
  displayOrder: number;
}

export const BODY_PARTS_INFO: BodyPartInfo[] = [
  { code: BODY_PARTS.SHOULDER, nameKo: '어깨', nameEn: 'Shoulder', displayOrder: 1 },
  { code: BODY_PARTS.CHEST, nameKo: '가슴', nameEn: 'Chest', displayOrder: 2 },
  { code: BODY_PARTS.BACK, nameKo: '등', nameEn: 'Back', displayOrder: 3 },
  { code: BODY_PARTS.ARM, nameKo: '팔', nameEn: 'Arm', displayOrder: 4 },
  { code: BODY_PARTS.ABDOMINAL, nameKo: '복근', nameEn: 'Abdominal', displayOrder: 5 },
  { code: BODY_PARTS.HIP, nameKo: '엉덩이', nameEn: 'Hip', displayOrder: 6 },
  { code: BODY_PARTS.LEG, nameKo: '다리', nameEn: 'Leg', displayOrder: 7 },
];
