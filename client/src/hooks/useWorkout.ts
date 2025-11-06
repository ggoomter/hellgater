import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workoutAPI } from '../services/api';
import type { WorkoutInput } from '@shared/types/workout.types';
import type { GetWorkoutRecordsParams } from '../services/api/workout.api';

/**
 * 운동 기록 생성 훅
 */
export function useCreateWorkoutRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WorkoutInput) => workoutAPI.createWorkoutRecord(data),
    onSuccess: (data) => {
      console.log('✅ Workout record created:', data);

      // 캐릭터 정보 리프레시 (경험치 반영)
      queryClient.invalidateQueries({ queryKey: ['character', 'me'] });

      // 운동 기록 목록 리프레시
      queryClient.invalidateQueries({ queryKey: ['workouts'] });

      // 레벨테스트 가능 여부 리프레시
      queryClient.invalidateQueries({ queryKey: ['level-tests', 'available'] });
    },
    onError: (error: any) => {
      console.error('❌ Failed to create workout record:', error);
    },
  });
}

/**
 * 운동 기록 조회 훅
 */
export function useWorkoutRecords(params?: GetWorkoutRecordsParams) {
  return useQuery({
    queryKey: ['workouts', params],
    queryFn: () => workoutAPI.getWorkoutRecords(params),
    staleTime: 1000 * 60 * 5, // 5분
  });
}

/**
 * 1RM 미리보기 계산 훅
 */
export function useCalculate1RM() {
  return {
    calculate: (weight: number, reps: number) => {
      return workoutAPI.calculate1RMPreview(weight, reps);
    },
  };
}

/**
 * 경험치 예상 계산 훅
 */
export function useEstimateExp() {
  return {
    estimate: (sets: number, reps: number, weight: number, difficulty?: number) => {
      return workoutAPI.estimateExp(sets, reps, weight, difficulty);
    },
  };
}
