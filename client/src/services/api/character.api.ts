import apiClient from './axios';
import type { ApiResponse } from '@shared/types/api.types';
import type { Character } from '@shared/types/user.types';

export interface CreateCharacterRequest {
  // Profile data (InBody 정보)
  gender: 'male' | 'female';
  birthdate: string; // YYYY-MM-DD 형식
  height: number; // cm
  weight: number; // kg
  bodyFatPercentage?: number; // 체지방률 (%)

  // Character appearance (optional)
  characterModel?: string;
  skinColor?: string;
}

export interface UpdateCharacterRequest {
  characterModel?: string;
  skinColor?: string;
}

/**
 * 캐릭터 생성
 */
export async function createCharacter(data: CreateCharacterRequest): Promise<Character> {
  const response = await apiClient.post<ApiResponse<Character>>('/characters', data);
  return response.data.data!;
}

/**
 * 내 캐릭터 조회
 */
export async function getMyCharacter(): Promise<Character> {
  const response = await apiClient.get<ApiResponse<Character>>('/characters/me');
  return response.data.data!;
}

/**
 * 내 캐릭터 수정
 */
export async function updateMyCharacter(data: UpdateCharacterRequest): Promise<Character> {
  const response = await apiClient.patch<ApiResponse<Character>>('/characters/me', data);
  return response.data.data!;
}
