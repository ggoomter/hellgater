import type { Grade } from '../constants/grades.js';

// Workout & Exercise Types

export interface Exercise {
  id: number;
  code: string;
  name: string;
  bodyPart: string;
  category: 'compound' | 'isolation' | 'cardio';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description?: string;
  howTo?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

export interface WorkoutInput {
  exerciseId: number;
  bodyPart: string;
  sets: number;
  reps: number;
  weight: number;
  workoutDate: string;
  notes?: string;
  videoUrl?: string;
}

export interface WorkoutRecord {
  id: string;
  userId: string;
  exerciseId: number;
  exerciseName: string;
  bodyPart: string;
  sets: number;
  reps: number;
  weight: number;
  calculated1RM?: number;
  rmPercentage?: number;
  grade?: Grade;
  expGained?: number;
  caloriesBurned?: number;
  verified: boolean;
  notes?: string;
  videoUrl?: string;
  workoutDate: string;
  createdAt: string;
}

export interface WorkoutResult {
  workout: WorkoutRecord;
  results: {
    levelUp: {
      didLevelUp: boolean;
      bodyPart: string;
      oldLevel: number;
      newLevel: number;
      rewards: Reward[];
    };
    expGained: {
      bodyPart: number;
      total: number;
      attribute?: number;
    };
    unlockedSkills: Skill[];
    newAchievements: Achievement[];
    mapProgress?: {
      stageCleared: boolean;
      stageName: string;
      progress: Record<string, number>;
    };
  };
}

export interface Reward {
  type: 'skill_point' | 'item' | 'title' | 'exp';
  value: string | number;
}

export interface Skill {
  id: number;
  code: string;
  name: string;
  bodyPart: string;
  tier: Grade;
  exerciseId?: number;
  requirements: {
    level?: number;
    reps?: number;
    weight?: number;
    prerequisiteSkills?: number[];
  };
  position: { x: number; y: number };
  iconUrl?: string;
  description?: string;
  isUnlocked?: boolean;
  isAvailable?: boolean;
}

export interface Achievement {
  id: number;
  code: string;
  name: string;
  description?: string;
  category: 'workout' | 'level' | 'streak' | 'social' | 'special';
  tier: Grade;
  conditionType: string;
  conditionValue: number;
  rewards: {
    exp: number;
    title?: string;
  };
  iconUrl?: string;
  badgeUrl?: string;
  progress?: number;
  isCompleted?: boolean;
}

// Level Test Types

export interface LevelTestCondition {
  exerciseId: number;
  exerciseName: string;
  requiredWeight: number;
  requiredReps: number;
  requiredSets: number;
}

export interface LevelTest {
  id: string;
  userId: string;
  bodyPartId: number;
  currentLevel: number;
  targetLevel: number;
  conditions: LevelTestCondition;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  workoutRecordId?: string;
  videoUrl?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewComment?: string;
  createdAt: string;
}

export interface StartLevelTestResponse {
  levelTest: {
    id: string;
    targetLevel: number;
    conditions: LevelTestCondition;
  };
}

export interface SubmitLevelTestRequest {
  workoutRecordId: string;
  videoUrl?: string;
}

export interface SubmitLevelTestResponse {
  success: boolean;
  levelTest: {
    id: string;
    status: string;
    submittedAt: string;
  };
  leveledUp?: boolean;
  newLevel?: number;
}

// Enhanced Workout Record Response with Level Test Info

export interface CreateWorkoutRecordResponse {
  workout: WorkoutRecord;
  expBreakdown: {
    baseExp: number;
    gradeBonus: number;
    volumeBonus: number;
    prBonus: number;
    levelPenalty: number;
    totalExp: number;
  };
  levelUp?: {
    didLevelUp: boolean;
    oldLevel: number;
    newLevel: number;
    levelsGained: number;
    bodyPartId: number;
    bodyPartName: string;
    rewards?: {
      skillPoints?: number;
      titles?: string[];
    };
  };
  levelTestAvailable?: {
    bodyPartId: number;
    bodyPartName: string;
    currentLevel: number;
    targetLevel: number;
    canStartTest: boolean;
  };
}
