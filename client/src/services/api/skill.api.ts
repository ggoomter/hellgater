import apiClient from './axios';

export interface Skill {
  id: number;
  code: string;
  nameKo: string;
  nameEn: string;
  tier: string;
  bodyPartId: number;
  description?: string;
  treePositionX: number;
  treePositionY: number;
  requiredLevel?: number;
  prerequisiteSkillIds: number[];
  isUnlocked: boolean;
}

export const skillApi = {
  getAll: async (bodyPartId?: number) => {
    const params = bodyPartId ? { bodyPartId } : {};
    const response = await apiClient.get<{ success: boolean; data: Skill[] }>('/skills', { params });
    return response.data.data;
  },

  getDetail: async (id: number) => {
    const response = await apiClient.get<{ success: boolean; data: Skill }>(`/skills/${id}`);
    return response.data.data;
  },
};
