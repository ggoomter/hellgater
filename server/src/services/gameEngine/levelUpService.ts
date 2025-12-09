/**
 * 레벨업 서비스
 * 경험치 추가 시 레벨업을 체크하고 처리합니다.
 */

import prisma from '../../config/database.js';

/**
 * 레벨업 결과
 */
export interface LevelUpResult {
  didLevelUp: boolean;
  oldLevel: number;
  newLevel: number;
  levelsGained: number;        // 몇 레벨을 올렸는지
  remainingExp: number;        // 남은 경험치
  rewards: {
    skillPoints?: number;      // 스킬 포인트
    titles?: string[];          // 칭호
  };
}

/**
 * 레벨업 서비스
 */
class LevelUpService {
  /**
   * 레벨업에 필요한 경험치 계산
   * 공식: baseExp(1000) × growthFactor(1.15)^(level-1)
   *
   * @param level - 목표 레벨
   * @returns 필요한 경험치
   */
  getRequiredExpForLevel(level: number): number {
    const baseExp = 1000;
    const growthFactor = 1.15;
    return Math.round(baseExp * Math.pow(growthFactor, level - 1));
  }

  /**
   * 경험치 추가 및 레벨업 체크
   *
   * @param userId - 사용자 ID
   * @param bodyPartId - 신체 부위 ID
   * @param expGained - 획득한 경험치
   * @returns 레벨업 결과
   */
  async applyExpAndCheckLevelUp(
    userId: string,
    bodyPartId: number,
    expGained: number
  ): Promise<LevelUpResult> {
    // 1. 현재 상태 조회
    const userBodyPart = await prisma.userBodyPart.findUnique({
      where: {
        userId_bodyPartId: {
          userId,
          bodyPartId,
        },
      },
    });

    if (!userBodyPart) {
      throw new Error('UserBodyPart not found');
    }

    let currentExp = userBodyPart.currentExp + expGained;
    let currentLevel = userBodyPart.level;
    let levelsGained = 0;
    const rewards: LevelUpResult['rewards'] = {};

    // 2. 레벨업 체크 (여러 레벨 한번에 오를 수 있음)
    while (true) {
      const requiredExp = this.getRequiredExpForLevel(currentLevel);
      
      if (currentExp >= requiredExp) {
        // 레벨업!
        currentExp -= requiredExp;
        currentLevel += 1;
        levelsGained += 1;

        // 레벨업 보상 체크
        if (currentLevel % 5 === 0) {
          // 5레벨마다 스킬 포인트
          rewards.skillPoints = (rewards.skillPoints || 0) + 1;
        }

        if (currentLevel % 10 === 0) {
          // 10레벨마다 칭호
          if (!rewards.titles) {
            rewards.titles = [];
          }
          rewards.titles.push(`${currentLevel}레벨 달성`);
        }
      } else {
        break;
      }
    }

    // 3. DB 업데이트
    await prisma.userBodyPart.update({
      where: {
        userId_bodyPartId: {
          userId,
          bodyPartId,
        },
      },
      data: {
        level: currentLevel,
        currentExp,
      },
    });

    // 4. 전체 레벨 업데이트 (레벨업이 발생한 경우)
    if (levelsGained > 0) {
      await this.updateCharacterTotalLevel(userId);
    }

    return {
      didLevelUp: levelsGained > 0,
      oldLevel: userBodyPart.level,
      newLevel: currentLevel,
      levelsGained,
      remainingExp: currentExp,
      rewards,
    };
  }

  /**
   * 전체 레벨 업데이트
   * 부위별 레벨의 평균값으로 계산
   *
   * @param userId - 사용자 ID
   */
  private async updateCharacterTotalLevel(userId: string): Promise<void> {
    const bodyParts = await prisma.userBodyPart.findMany({
      where: { userId },
      select: { level: true },
    });

    if (bodyParts.length === 0) return;

    const totalLevel = Math.floor(
      bodyParts.reduce((sum, bp) => sum + bp.level, 0) / bodyParts.length
    );

    await prisma.character.update({
      where: { userId },
      data: { totalLevel },
    });
  }
}

export const levelUpService = new LevelUpService();

