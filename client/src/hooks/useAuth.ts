import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authAPI, characterAPI } from '../services/api';
import { setCredentials, logout as logoutAction } from '../store/slices/authSlice';
import { persistor } from '../store/store';
import type { LoginRequest, RegisterRequest } from '@shared/types/api.types';

/**
 * 로그인 Hook
 * TEST: 파일 변경 자동 반영 테스트
 */
export function useLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  console.log('🟢 useLogin hook initialized');

  return useMutation({
    mutationFn: (data: LoginRequest) => {
      console.log('🟡 mutationFn called with:', data);
      return authAPI.login(data);
    },
    onSuccess: async (response) => {
      console.log('✅ Login success:', response);

      // Redux에 인증 정보 저장
      dispatch(
        setCredentials({
          user: response.user,
          accessToken: response.tokens.accessToken,
          refreshToken: response.tokens.refreshToken,
        })
      );

      console.log('✅ Credentials saved to Redux');

      // Redux Persist가 localStorage에 저장 완료될 때까지 대기
      console.log('⏳ Flushing Redux Persist...');
      await persistor.flush();
      console.log('✅ Redux Persist flushed');

      // 캐릭터 존재 여부 확인
      try {
        console.log('🔍 Checking if character exists...');
        const character = await characterAPI.getMyCharacter();
        console.log('✅ Character exists:', character);
        // 캐릭터 있음 -> 대시보드로
        navigate('/dashboard');
      } catch (error: any) {
        console.log('ℹ️ No character found:', error?.response?.status);
        // 캐릭터 없음 (404) -> 캐릭터 생성으로
        if (error?.response?.status === 404) {
          navigate('/character/create');
        } else {
          // 다른 에러 -> 일단 대시보드로
          navigate('/dashboard');
        }
      }
    },
    onError: (error) => {
      console.error('❌ Login failed:', error);
    },
  });
}

/**
 * 회원가입 Hook
 */
export function useRegister() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authAPI.register(data),
    onSuccess: async (response) => {
      // Redux에 인증 정보 저장
      dispatch(
        setCredentials({
          user: response.user,
          accessToken: response.tokens.accessToken,
          refreshToken: response.tokens.refreshToken,
        })
      );

      // Redux Persist가 localStorage에 저장 완료될 때까지 대기
      console.log('⏳ Flushing Redux Persist...');
      await persistor.flush();
      console.log('✅ Redux Persist flushed');

      // 캐릭터 생성 페이지로 이동
      navigate('/character/create');
    },
  });
}

/**
 * 로그아웃 Hook
 */
export function useLogout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authAPI.logout(),
    onSuccess: () => {
      // Redux 상태 초기화
      dispatch(logoutAction());

      // React Query 캐시 초기화
      queryClient.clear();

      // 로그인 페이지로 이동
      navigate('/login');
    },
  });
}

/**
 * 현재 사용자 정보 조회 Hook
 */
export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => authAPI.getMe(),
    staleTime: 5 * 60 * 1000, // 5분
    retry: false,
  });
}
