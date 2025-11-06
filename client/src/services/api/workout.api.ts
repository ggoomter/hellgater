import axios from './axios';
import type {
  WorkoutInput,
  CreateWorkoutRecordResponse,
} from '@shared/types/workout.types';

/**
 * 운동 기록 생성
 */
export async function createWorkoutRecord(data: WorkoutInput): Promise<CreateWorkoutRecordResponse> {
  const response = await axios.post<CreateWorkoutRecordResponse>('/workouts', data);
  return response.data;
}

/**
 * 운동 기록 조회
 */
export interface GetWorkoutRecordsParams {
  bodyPartId?: number;
  exerciseId?: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface WorkoutRecordStats {
  totalWorkouts: number;
  totalCalories: number;
  totalVolume: number;
  recentPRs: Array<{
    bodyPartId: number;
    bodyPartName: string;
    exerciseName: string;
    weight: number;
    reps: number;
    date: string;
  }>;
}

export interface GetWorkoutRecordsResponse {
  workouts: Array<{
    id: string;
    exerciseId: number;
    bodyPartId: number;
    sets: number;
    reps: number;
    weight: number;
    calculated1RM?: number;
    rmPercentage?: number;
    grade?: string;
    expGained?: number;
    caloriesBurned?: number;
    videoUrl?: string;
    notes?: string;
    verified: boolean;
    workoutDate: string;
    createdAt: string;
  }>;
  total: number;
  stats: WorkoutRecordStats;
}

export async function getWorkoutRecords(
  params?: GetWorkoutRecordsParams
): Promise<GetWorkoutRecordsResponse> {
  const response = await axios.get<GetWorkoutRecordsResponse>('/workouts', { params });
  return response.data;
}

/**
 * 1RM 계산 (클라이언트 사이드 미리보기용)
 */
export function calculate1RMPreview(weight: number, reps: number): number {
  if (reps === 1) {
    return weight;
  }
  const oneRM = weight * (1 + reps / 30);
  return Math.round(oneRM * 10) / 10;
}

/**
 * 경험치 예상 계산 (간단 버전)
 */
export function estimateExp(
  sets: number,
  reps: number,
  weight: number,
  difficulty: number = 5
): number {
  const baseExp = sets * reps * weight * (difficulty / 10);
  return Math.round(baseExp);
}
