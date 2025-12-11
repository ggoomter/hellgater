// User & Character Types

export interface User {
  id: string;
  email: string;
  username: string;
  profileImageUrl?: string;
  bio?: string;
  gender?: 'male' | 'female' | 'other';
  birthdate?: string;
  height?: number;
  weight?: number;
  createdAt: string;
  subscriptionTier: 'free' | 'premium';
}

export interface Character {
  id: string;
  userId: string;
  characterModel: string;
  skinColor?: string;
  totalLevel: number;
  totalExp: number;
  nextLevelExp: number;
  stats: CharacterStats;
  attributes: CharacterAttributes;
  bodyParts?: Array<{
    id: string;
    code: string;
    name: string;
    level: number;
    currentExp: number;
    nextLevelExp: number;
    max1RM: number;
    lastWorkoutAt?: string;
  }>;
}

export interface CharacterStats {
  muscleEndurance: number;
  strength: number;
  explosivePower: number;
  speed: number;
  mentalPower: number;
  flexibility: number;
  knowledge: number;
  balance: number;
  agility: number;
}

export interface CharacterAttributes {
  earth: number;
  fire: number;
  wind: number;
  water: number;
  mind: number;
}

export interface UserBodyPart {
  id: string;
  bodyPartCode: string;
  bodyPartName: string;
  level: number;
  currentExp: number;
  nextLevelExp: number;
  max1RM: number;
  lastWorkoutAt?: string;
}
