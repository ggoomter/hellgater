import axios from 'axios';
import type { ApiResponse } from '@shared/types/api.types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - 토큰 자동 첨부
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - 에러 처리 및 토큰 갱신
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고 토큰 갱신을 아직 시도하지 않았다면
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          // 토큰 갱신 시도
          const response = await axios.post<ApiResponse<{ accessToken: string; expiresIn: number }>>(
            `${BASE_URL}/auth/refresh`,
            { refreshToken }
          );

          if (response.data.success && response.data.data) {
            const { accessToken } = response.data.data;

            // 새 토큰 저장
            localStorage.setItem('accessToken', accessToken);

            // 원래 요청 재시도
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // 토큰 갱신 실패 - 로그아웃 처리
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // Refresh Token이 없으면 로그인 페이지로
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
