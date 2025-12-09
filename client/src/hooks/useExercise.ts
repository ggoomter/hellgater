import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api';

interface BodyPart {
  id: number;
  code: string;
  nameKo: string;
  nameEn: string;
  displayOrder: number;
  exerciseCount: number;
}

interface Exercise {
  id: number;
  code: string;
  nameKo: string;
  nameEn: string;
  category: string;
  difficulty: string;
  description: string;
  thumbnailUrl: string;
  bodyPartName: string;
}

interface ExerciseDetail extends Exercise {
  howTo: string;
  videoUrl: string;
  caloriePerRepKg: number;
}

/**
 * 모든 운동 부위 목록 조회
 */
export const useBodyParts = () => {
  return useQuery<{ bodyParts: BodyPart[] }>({
    queryKey: ['bodyParts'],
    queryFn: async () => {
      const response = await apiClient.get('/exercises/body-parts');
      return response.data;
    },
  });
};

/**
 * 특정 부위의 운동 목록 조회
 */
export const useExercisesByBodyPart = (bodyPartId: number | null) => {
  return useQuery<{ exercises: Exercise[] }>({
    queryKey: ['exercises', 'byBodyPart', bodyPartId],
    queryFn: async () => {
      if (!bodyPartId) return { exercises: [] };
      const response = await apiClient.get(`/exercises/by-body-part/${bodyPartId}`);
      return response.data;
    },
    enabled: !!bodyPartId, // bodyPartId가 있을 때만 쿼리 실행
  });
};

/**
 * 특정 운동의 상세 정보 조회
 */
export const useExerciseDetail = (exerciseId: number | null) => {
  return useQuery<{ exercise: ExerciseDetail }>({
    queryKey: ['exercise', exerciseId],
    queryFn: async () => {
      if (!exerciseId) throw new Error('Exercise ID is required');
      const response = await apiClient.get(`/exercises/${exerciseId}`);
      return response.data;
    },
    enabled: !!exerciseId, // exerciseId가 있을 때만 쿼리 실행
  });
};
