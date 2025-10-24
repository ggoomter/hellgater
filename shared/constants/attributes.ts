// 5 Attributes Constants

export const ATTRIBUTES = {
  NONE: 'none',
  EARTH: 'earth',
  FIRE: 'fire',
  WIND: 'wind',
  WATER: 'water',
  MIND: 'mind',
} as const;

export type AttributeType = (typeof ATTRIBUTES)[keyof typeof ATTRIBUTES];

export interface AttributeInfo {
  code: AttributeType;
  nameKo: string;
  nameEn: string;
  description: string;
  color: string;
  icon: string;
}

export const ATTRIBUTES_INFO: Record<AttributeType, AttributeInfo> = {
  none: {
    code: ATTRIBUTES.NONE,
    nameKo: '무속성',
    nameEn: 'None',
    description: '기초적인 종합 운동',
    color: '#78E6C8',
    icon: '🌱',
  },
  earth: {
    code: ATTRIBUTES.EARTH,
    nameKo: '땅(근육)',
    nameEn: 'Earth (Muscle)',
    description: '보디빌딩 분할, 부위별 집중, 자극에 집중',
    color: '#F5DEB3',
    icon: '🪨',
  },
  fire: {
    code: ATTRIBUTES.FIRE,
    nameKo: '불(체력)',
    nameEn: 'Fire (Stamina)',
    description: '크로스핏 운동, 고강도 전신 운동, 유산소+무산소 조합',
    color: '#FF6347',
    icon: '🔥',
  },
  wind: {
    code: ATTRIBUTES.WIND,
    nameKo: '바람(심폐)',
    nameEn: 'Wind (Cardio)',
    description: '사지적 운동, 맨몸운동, 고강도 리듬, 사이클',
    color: '#40E0D0',
    icon: '💨',
  },
  water: {
    code: ATTRIBUTES.WATER,
    nameKo: '물(지방)',
    nameEn: 'Water (Fat Loss)',
    description: '저강도 장시간 유산소, 약한 맨몸운동',
    color: '#4169E1',
    icon: '💧',
  },
  mind: {
    code: ATTRIBUTES.MIND,
    nameKo: '마음(근성)',
    nameEn: 'Mind (Mental)',
    description: '월벤 놀지 않는다',
    color: '#9370DB',
    icon: '🧠',
  },
};
