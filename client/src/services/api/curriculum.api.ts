import apiClient from './axios';
import { ApiResponse } from '@shared/types/api.types';

export interface ContentModule {
  id: string;
  weekId: number;
  displayOrder: number;
  moduleType: string;
  titleKo: string;
  titleEn: string;
  description?: string;
  contentData: any;
  videoUrl?: string;
  thumbnailUrl?: string;
  imageUrls: string[];
  audioUrl?: string;
  isInteractive: boolean;
  hasQuiz: boolean;
  requiresCompletion: boolean;
  expReward: number;
  estimatedTime?: number;
  isCompleted?: boolean;
}

const curriculumApi = {
  // 주차 목록 조회
  getAllWeeks: async () => {
    const response = await apiClient.get<ApiResponse<any>>('/curriculum/weeks');
    return response.data;
  },

  // 특정 주차 상세 조회
  getWeekByNumber: async (weekNumber: number) => {
    const response = await apiClient.get<ApiResponse<any>>(`/curriculum/weeks/${weekNumber}`);
    return response.data;
  },

  // 특정 주차의 콘텐츠 모듈 조회
  getWeekModules: async (weekNumber: number) => {
    const response = await apiClient.get<ApiResponse<any>>(`/curriculum/weeks/${weekNumber}/modules`);
    return response.data;
  },

  // 진행 상황 조회
  getProgress: async () => {
    const response = await apiClient.get<ApiResponse<any>>('/curriculum/progress');
    return response.data;
  },

  // 특정 주차 진행 상황 조회
  getWeekProgress: async (weekNumber: number) => {
    const response = await apiClient.get<ApiResponse<any>>(`/curriculum/weeks/${weekNumber}/progress`);
    return response.data;
  },

  // 주차 시작
  startWeek: async (weekNumber: number) => {
    const response = await apiClient.post<ApiResponse<any>>(`/curriculum/weeks/${weekNumber}/start`);
    return response.data;
  },

  // 콘텐츠 완료
  completeModule: async (moduleId: string, data: { performanceData?: any; expGained?: number } = {}) => {
    const response = await apiClient.post<ApiResponse<any>>(`/curriculum/modules/${moduleId}/complete`, data);
    return response.data;
  },

  // 퀴즈 제출
  submitQuiz: async (moduleId: string, data: { answers: Record<string, any>; score: number }) => {
    const response = await apiClient.post<ApiResponse<any>>(`/curriculum/modules/${moduleId}/submit-quiz`, data);
    return response.data;
  },
};

// Export individual functions for easier access
export const getAllWeeks = curriculumApi.getAllWeeks;
export const getWeekByNumber = curriculumApi.getWeekByNumber;
export const getWeekModules = curriculumApi.getWeekModules;
export const getProgress = curriculumApi.getProgress;
export const getWeekProgress = curriculumApi.getWeekProgress;
export const startWeek = curriculumApi.startWeek;
export const completeModule = curriculumApi.completeModule;
export const submitQuiz = curriculumApi.submitQuiz;

// Also export as default object for backward compatibility
export default curriculumApi;
export { curriculumApi };
