import apiClient from './axios';
import { ApiResponse } from '@shared/types/api.types';

export interface ProgressPhotoUploadRequest {
  photoType: 'front' | 'side' | 'back';
  photoUrl: string;
  thumbnailUrl?: string;
  photoDate?: string;
  photoTime?: string;
  measurementId?: string;
  weekNumber?: number;
  isPublic?: boolean;
  fileSizeBytes: number;
  imageWidth?: number;
  imageHeight?: number;
}

export interface ProgressPhoto {
  id: string;
  userId: string;
  photoType: string;
  photoUrl: string;
  thumbnailUrl?: string;
  photoDate: Date;
  weekNumber?: number;
  fileSizeBytes: number;
  imageWidth?: number;
  imageHeight?: number;
  createdAt: Date;
}

export const measurementApi = {
  // 진행 사진 업로드
  uploadProgressPhoto: async (data: ProgressPhotoUploadRequest) => {
    const response = await apiClient.post<ApiResponse<ProgressPhoto>>('/measurements/photos', data);
    return response.data;
  },

  // 진행 사진 조회
  getProgressPhotos: async (weekNumber?: number) => {
    const params = weekNumber ? { weekNumber } : {};
    const response = await apiClient.get<ApiResponse<ProgressPhoto[]>>('/measurements/photos', { params });
    return response.data;
  },
};

