import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import * as characterAPI from '../services/api/character.api';
import type { CreateCharacterRequest, UpdateCharacterRequest } from '../services/api/character.api';

/**
 * 캐릭터 생성 Hook
 */
export function useCreateCharacter() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCharacterRequest) => characterAPI.createCharacter(data),
    onSuccess: (character) => {
      // 캐릭터 생성 성공 시 쿼리 캐시 업데이트
      queryClient.setQueryData(['character', 'me'], character);

      // 홈으로 이동
      navigate('/');
    },
  });
}

/**
 * 내 캐릭터 조회 Hook
 */
export function useMyCharacter() {
  return useQuery({
    queryKey: ['character', 'me'],
    queryFn: () => characterAPI.getMyCharacter(),
    staleTime: 5 * 60 * 1000, // 5분
    retry: false,
  });
}

/**
 * 내 캐릭터 수정 Hook
 */
export function useUpdateCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCharacterRequest) => characterAPI.updateMyCharacter(data),
    onSuccess: (character) => {
      // 캐릭터 수정 성공 시 쿼리 캐시 업데이트
      queryClient.setQueryData(['character', 'me'], character);
    },
  });
}
