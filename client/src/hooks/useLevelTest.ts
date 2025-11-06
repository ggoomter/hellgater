import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { levelTestAPI } from '../services/api';
import type {
  StartLevelTestRequest,
  SubmitLevelTestRequest,
} from '../services/api/levelTest.api';

/**
 * 레벨테스트 가능 여부 조회 훅
 */
export function useAvailableLevelTests() {
  return useQuery({
    queryKey: ['level-tests', 'available'],
    queryFn: () => levelTestAPI.getAvailableLevelTests(),
    staleTime: 1000 * 60 * 1, // 1분
  });
}

/**
 * 레벨테스트 시작 훅
 */
export function useStartLevelTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StartLevelTestRequest) => levelTestAPI.startLevelTest(data),
    onSuccess: (data) => {
      console.log('✅ Level test started:', data);

      // 레벨테스트 목록 리프레시
      queryClient.invalidateQueries({ queryKey: ['level-tests'] });

      // 가능한 레벨테스트 목록 리프레시
      queryClient.invalidateQueries({ queryKey: ['level-tests', 'available'] });

      // 캐릭터 정보 리프레시 (canTakeLevelTest 상태 반영)
      queryClient.invalidateQueries({ queryKey: ['character', 'me'] });
    },
    onError: (error: any) => {
      console.error('❌ Failed to start level test:', error);
    },
  });
}

/**
 * 레벨테스트 제출 훅
 */
export function useSubmitLevelTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ levelTestId, data }: { levelTestId: string; data: SubmitLevelTestRequest }) =>
      levelTestAPI.submitLevelTest(levelTestId, data),
    onSuccess: (data) => {
      console.log('✅ Level test submitted:', data);

      // 레벨업 성공 시
      if (data.leveledUp) {
        console.log(`🎉 레벨업! 새 레벨: ${data.newLevel}`);
      }

      // 모든 관련 쿼리 리프레시
      queryClient.invalidateQueries({ queryKey: ['level-tests'] });
      queryClient.invalidateQueries({ queryKey: ['level-tests', 'available'] });
      queryClient.invalidateQueries({ queryKey: ['character', 'me'] });
    },
    onError: (error: any) => {
      console.error('❌ Failed to submit level test:', error);
    },
  });
}

/**
 * 레벨테스트 기록 조회 훅
 */
export function useLevelTests(params?: {
  status?: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  bodyPartId?: number;
}) {
  return useQuery({
    queryKey: ['level-tests', params],
    queryFn: () => levelTestAPI.getLevelTests(params),
    staleTime: 1000 * 60 * 5, // 5분
  });
}

/**
 * 특정 레벨테스트 조회 훅
 */
export function useLevelTest(levelTestId: string) {
  return useQuery({
    queryKey: ['level-tests', levelTestId],
    queryFn: () => levelTestAPI.getLevelTest(levelTestId),
    enabled: !!levelTestId,
    staleTime: 1000 * 60 * 5, // 5분
  });
}
