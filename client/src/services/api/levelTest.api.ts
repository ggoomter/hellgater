import axios from './axios';
import type {
  StartLevelTestResponse,
  SubmitLevelTestRequest,
  SubmitLevelTestResponse,
  LevelTest,
} from '@shared/types/workout.types';

/**
 * 레벨테스트 가능 여부 조회
 */
export interface AvailableLevelTest {
  bodyPartId: number;
  bodyPartName: string;
  currentLevel: number;
  targetLevel: number;
  currentExp: number;
  requiredExp: number;
}

export interface GetAvailableLevelTestsResponse {
  available: AvailableLevelTest[];
}

export async function getAvailableLevelTests(): Promise<GetAvailableLevelTestsResponse> {
  const response = await axios.get<GetAvailableLevelTestsResponse>('/level-tests/available');
  return response.data;
}

/**
 * 레벨테스트 시작
 */
export interface StartLevelTestRequest {
  bodyPartId: number;
}

export async function startLevelTest(
  data: StartLevelTestRequest
): Promise<StartLevelTestResponse> {
  const response = await axios.post<StartLevelTestResponse>('/level-tests/start', data);
  return response.data;
}

/**
 * 레벨테스트 제출
 */
export async function submitLevelTest(
  levelTestId: string,
  data: SubmitLevelTestRequest
): Promise<SubmitLevelTestResponse> {
  const response = await axios.post<SubmitLevelTestResponse>(
    `/level-tests/${levelTestId}/submit`,
    data
  );
  return response.data;
}

/**
 * 레벨테스트 기록 조회
 */
export interface GetLevelTestsParams {
  status?: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  bodyPartId?: number;
}

export interface LevelTestRecord {
  id: string;
  bodyPartId: number;
  bodyPartName: string;
  currentLevel: number;
  targetLevel: number;
  conditions: {
    exerciseId: number;
    exerciseName: string;
    requiredWeight: number;
    requiredReps: number;
    requiredSets: number;
  };
  status: string;
  workoutRecord?: {
    id: string;
    exerciseName: string;
    sets: number;
    reps: number;
    weight: number;
  };
  videoUrl?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewComment?: string;
  createdAt: string;
}

export interface GetLevelTestsResponse {
  levelTests: LevelTestRecord[];
}

export async function getLevelTests(
  params?: GetLevelTestsParams
): Promise<GetLevelTestsResponse> {
  const response = await axios.get<GetLevelTestsResponse>('/level-tests', { params });
  return response.data;
}

/**
 * 특정 레벨테스트 조회
 */
export async function getLevelTest(levelTestId: string): Promise<LevelTestRecord> {
  const response = await axios.get<LevelTestRecord>(`/level-tests/${levelTestId}`);
  return response.data;
}
