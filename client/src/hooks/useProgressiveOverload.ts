import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api/axios';

/**
 * 프로그레시브 오버로드 추천 조회
 */
export function useProgressiveOverloadRecommendation(exerciseId: number | null) {
  return useQuery({
    queryKey: ['progressive-overload', exerciseId],
    queryFn: async () => {
      if (!exerciseId) return null;
      const response = await apiClient.get(`/exercises/${exerciseId}/progressive-overload`);
      return response.data.recommendation;
    },
    enabled: !!exerciseId,
    staleTime: 1000 * 60 * 5, // 5분간 캐시
  });
}

