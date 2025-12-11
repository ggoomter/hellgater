import apiClient from './axios';
import { ApiResponse } from '@shared/types/api.types';

export interface CompleteStageRequest {
  stageCode: string;
  score?: number;
  completionTimeSeconds?: number;
}

export interface StageCompletionResult {
  expGained: number;
  nextStageUnlocked?: boolean;
  rewards?: {
    exp: number;
    items?: any[];
  };
}

export const mapApi = {
  // 스테이지 완료
  completeStage: async (data: CompleteStageRequest) => {
    const response = await apiClient.post<ApiResponse<StageCompletionResult>>('/map/stages/complete', data);
    return response.data;
  },
};

