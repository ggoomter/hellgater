import apiClient from './axios';
import type {
  ApiResponse,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '@shared/types/api.types';
import type { User } from '@shared/types/user.types';

/**
 * 회원가입
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
  return response.data.data!;
}

/**
 * 로그인
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
  return response.data.data!;
}

/**
 * 로그아웃
 */
export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

/**
 * 토큰 갱신
 */
export async function refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
  const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh', data);
  return response.data.data!;
}

/**
 * 현재 사용자 정보 조회
 */
export async function getMe(): Promise<User> {
  const response = await apiClient.get<ApiResponse<User>>('/auth/me');
  return response.data.data!;
}
