# 헬게이터 - 게임 시스템 로직 설계

## 목차
1. [RM 분석 시스템](#1-rm-분석-시스템)
2. [경험치 계산 시스템](#2-경험치-계산-시스템)
3. [레벨 시스템](#3-레벨-시스템)
4. [스킬트리 시스템](#4-스킬트리-시스템)
5. [맵 탐험 시스템](#5-맵-탐험-시스템)
6. [퀘스트 시스템](#6-퀘스트-시스템)
7. [업적 시스템](#7-업적-시스템)

---

## 1. RM 분석 시스템

### 1.1 1RM 계산 공식

**기본 공식** (CLAUDE.md 참조):
```typescript
function calculate1RM(weight: number, reps: number): number {
  const additionalWeight = weight * 0.025 * reps;
  const maxWeight = weight + additionalWeight;
  return maxWeight;
}

// 예시:
// 벤치프레스 60kg × 10회
// 추가중량 = 60 × 0.025 × 10 = 15kg
// 1RM = 60 + 15 = 75kg
```

**RM 백분율 표** (횟수 → RM %):
```typescript
const RM_PERCENTAGE_TABLE: Record<number, number> = {
  1: 100, 2: 95, 3: 90, 4: 88, 5: 86, 6: 83,
  7: 80, 8: 78, 9: 76, 10: 75, 11: 72, 12: 70,
  13: 68, 14: 66, 15: 65, 16: 63, 17: 61, 18: 60,
  19: 58, 20: 57
};

function getRMPercentage(reps: number): number {
  if (reps <= 20) return RM_PERCENTAGE_TABLE[reps];
  // 20회 초과 시 선형 보간
  return Math.max(50, 57 - (reps - 20) * 0.5);
}

// 역산: 현재 무게 → 1RM
function calculate1RMFromPercentage(weight: number, reps: number): number {
  const percentage = getRMPercentage(reps);
  return (weight / percentage) * 100;
}
```

### 1.2 등급 평가 시스템

**체중별 등급 테이블** (예: 데드리프트 10회 기준):

```typescript
interface GradeThreshold {
  bodyWeight: number; // 체중 (kg)
  grades: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
    diamond: number;
    master: number;
    challenger: number;
  };
}

const DEADLIFT_10REPS_GRADES: GradeThreshold[] = [
  {
    bodyWeight: 55,
    grades: { bronze: 20, silver: 30, gold: 40, platinum: 60, diamond: 80, master: 90, challenger: 100 }
  },
  {
    bodyWeight: 60,
    grades: { bronze: 20, silver: 35, gold: 50, platinum: 65, diamond: 85, master: 100, challenger: 130 }
  },
  {
    bodyWeight: 65,
    grades: { bronze: 20, silver: 40, gold: 50, platinum: 70, diamond: 85, master: 110, challenger: 140 }
  },
  {
    bodyWeight: 70,
    grades: { bronze: 20, silver: 45, gold: 60, platinum: 70, diamond: 90, master: 115, challenger: 155 }
  },
  {
    bodyWeight: 75,
    grades: { bronze: 20, silver: 50, gold: 65, platinum: 80, diamond: 100, master: 120, challenger: 160 }
  }
];

type Grade = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'challenger';

function evaluateGrade(
  bodyWeight: number,
  weight: number,
  exercise: string,
  reps: number
): Grade {
  // 1. 체중에 가장 가까운 등급 테이블 찾기
  const gradeTable = findClosestGradeTable(bodyWeight, exercise, reps);

  // 2. 등급 판정
  if (weight >= gradeTable.challenger) return 'challenger';
  if (weight >= gradeTable.master) return 'master';
  if (weight >= gradeTable.diamond) return 'diamond';
  if (weight >= gradeTable.platinum) return 'platinum';
  if (weight >= gradeTable.gold) return 'gold';
  if (weight >= gradeTable.silver) return 'silver';
  return 'bronze';
}
```

### 1.3 경험치 배율 (등급 기반)

```typescript
const GRADE_EXP_MULTIPLIER: Record<Grade, number> = {
  bronze: 1.0,
  silver: 1.2,
  gold: 1.5,
  platinum: 2.0,
  diamond: 2.5,
  master: 3.0,
  challenger: 4.0
};
```

---

## 2. 경험치 계산 시스템

### 2.1 기본 경험치 계산

**공식**:
```typescript
interface WorkoutExpInput {
  exercise: string;
  bodyPart: string;
  weight: number;
  reps: number;
  sets: number;
  userBodyWeight: number;
}

interface ExpResult {
  baseExp: number;          // 기본 경험치
  gradeBonus: number;       // 등급 보너스
  totalExp: number;         // 총 경험치
  grade: Grade;             // 달성 등급
  calories: number;         // 소모 칼로리
}

function calculateWorkoutExp(input: WorkoutExpInput): ExpResult {
  // 1. 기본 경험치 (무게 × 횟수 × 세트)
  const baseExp = input.weight * input.reps * input.sets;

  // 2. 등급 평가
  const grade = evaluateGrade(
    input.userBodyWeight,
    input.weight,
    input.exercise,
    input.reps
  );

  // 3. 등급 배율 적용
  const multiplier = GRADE_EXP_MULTIPLIER[grade];
  const gradeBonus = baseExp * (multiplier - 1);
  const totalExp = Math.round(baseExp * multiplier);

  // 4. 칼로리 계산 (kg당 kcal/rep)
  const caloriePerRepKg = 0.05; // exercises 테이블에서 가져옴
  const calories = input.weight * input.reps * input.sets * caloriePerRepKg;

  return {
    baseExp,
    gradeBonus,
    totalExp,
    grade,
    calories
  };
}

// 예시:
// 벤치프레스 60kg × 10회 × 3세트, 체중 70kg
// baseExp = 60 × 10 × 3 = 1800
// grade = 'gold' (등급 테이블 참조)
// multiplier = 1.5
// totalExp = 1800 × 1.5 = 2700
// calories = 60 × 10 × 3 × 0.05 = 90kcal
```

### 2.2 경험치 분배

운동 1회 → 여러 경험치 획득:

```typescript
interface ExpDistribution {
  bodyPartExp: number;      // 해당 부위 경험치 (80%)
  totalExp: number;         // 전체 레벨 경험치 (20%)
  attributeExp?: number;    // 속성 진행도 (맵 진행 중일 경우)
}

function distributeExp(totalExp: number, activeAttribute?: string): ExpDistribution {
  const bodyPartExp = Math.round(totalExp * 0.8);
  const characterTotalExp = Math.round(totalExp * 0.2);

  // 속성 과정 진행 중이면 추가 보너스
  let attributeExp = 0;
  if (activeAttribute) {
    attributeExp = Math.round(totalExp * 0.3); // 30% 보너스
  }

  return {
    bodyPartExp,
    totalExp: characterTotalExp,
    attributeExp
  };
}
```

---

## 3. 레벨 시스템

### 3.1 레벨업 경험치 테이블

**부위별 레벨** (1-100레벨):

```typescript
function getNextLevelExp(currentLevel: number): number {
  // 지수 곡선 (초반 빠르게, 후반 느리게)
  const baseExp = 1000;
  const growthFactor = 1.15;

  return Math.round(baseExp * Math.pow(growthFactor, currentLevel - 1));
}

// 레벨별 필요 경험치 예시:
// Lv1 → Lv2: 1,000 exp
// Lv2 → Lv3: 1,150 exp
// Lv5 → Lv6: 1,749 exp
// Lv10 → Lv11: 3,518 exp
// Lv20 → Lv21: 13,267 exp
// Lv50 → Lv51: 108,366 exp
```

**전체 레벨** (부위별 레벨의 평균):

```typescript
function calculateTotalLevel(bodyPartLevels: number[]): number {
  // 7개 부위 레벨의 평균
  const sum = bodyPartLevels.reduce((a, b) => a + b, 0);
  return Math.floor(sum / bodyPartLevels.length);
}
```

### 3.2 레벨업 처리 로직

```typescript
interface LevelUpResult {
  didLevelUp: boolean;
  newLevel: number;
  overflow: number;         // 넘친 경험치
  rewards: Reward[];
  unlockedSkills: Skill[];
}

async function applyExpAndCheckLevelUp(
  userId: string,
  bodyPart: string,
  expGained: number
): Promise<LevelUpResult> {
  // 1. 현재 상태 가져오기
  const userBodyPart = await getUserBodyPart(userId, bodyPart);
  let currentExp = userBodyPart.currentExp + expGained;
  let currentLevel = userBodyPart.level;
  let didLevelUp = false;
  const rewards: Reward[] = [];
  const unlockedSkills: Skill[] = [];

  // 2. 레벨업 체크 (여러 레벨 한번에 오를 수 있음)
  while (true) {
    const requiredExp = getNextLevelExp(currentLevel);

    if (currentExp >= requiredExp) {
      // 레벨업!
      currentExp -= requiredExp;
      currentLevel += 1;
      didLevelUp = true;

      // 보상 지급
      const levelRewards = getLevelRewards(currentLevel);
      rewards.push(...levelRewards);

      // 스킬 해금 체크
      const newSkills = await checkSkillUnlocks(userId, bodyPart, currentLevel);
      unlockedSkills.push(...newSkills);

    } else {
      break;
    }
  }

  // 3. DB 업데이트
  await updateUserBodyPart(userId, bodyPart, {
    level: currentLevel,
    currentExp: currentExp
  });

  // 4. 전체 레벨 업데이트
  if (didLevelUp) {
    await updateCharacterTotalLevel(userId);
  }

  return {
    didLevelUp,
    newLevel: currentLevel,
    overflow: currentExp,
    rewards,
    unlockedSkills
  };
}
```

### 3.3 레벨업 보상

```typescript
interface Reward {
  type: 'skill_point' | 'item' | 'title';
  value: any;
}

function getLevelRewards(level: number): Reward[] {
  const rewards: Reward[] = [];

  // 5레벨마다 스킬 포인트
  if (level % 5 === 0) {
    rewards.push({ type: 'skill_point', value: 1 });
  }

  // 10레벨마다 칭호
  if (level % 10 === 0) {
    rewards.push({
      type: 'title',
      value: `${level}레벨 달성`
    });
  }

  return rewards;
}
```

---

## 4. 스킬트리 시스템

### 4.1 스킬 데이터 구조

```typescript
interface Skill {
  id: number;
  code: string;
  name: string;
  bodyPart: string;
  tier: 'beginner' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'challenger';

  // 해금 조건
  requirements: {
    level?: number;           // 최소 레벨
    reps?: number;            // 요구 횟수
    weight?: number;          // 요구 무게
    prerequisiteSkills?: number[]; // 선행 스킬 ID
  };

  // 연관 운동
  exerciseId: number;

  // 시각화
  position: { x: number; y: number };
  iconUrl: string;
}

// 예시: 가슴 스킬트리
const CHEST_SKILL_TREE: Skill[] = [
  {
    id: 1,
    code: 'pushup_15',
    name: '푸쉬업 15회',
    bodyPart: 'chest',
    tier: 'beginner',
    requirements: { reps: 15 },
    exerciseId: 101,
    position: { x: 0, y: 0 },
    iconUrl: '/skills/pushup.png'
  },
  {
    id: 2,
    code: 'bench_pushup',
    name: '벤치 푸쉬업',
    bodyPart: 'chest',
    tier: 'beginner',
    requirements: { prerequisiteSkills: [1] },
    exerciseId: 102,
    position: { x: 1, y: 0 },
    iconUrl: '/skills/bench_pushup.png'
  },
  {
    id: 3,
    code: 'dips_5',
    name: '딥스 5회',
    bodyPart: 'chest',
    tier: 'silver',
    requirements: {
      level: 3,
      prerequisiteSkills: [1]
    },
    exerciseId: 103,
    position: { x: 0, y: 1 },
    iconUrl: '/skills/dips.png'
  },
  {
    id: 4,
    code: 'bench_press_15kg_15reps',
    name: '벤치프레스 15kg 15회',
    bodyPart: 'chest',
    tier: 'silver',
    requirements: {
      level: 5,
      weight: 15,
      reps: 15,
      prerequisiteSkills: [2]
    },
    exerciseId: 104,
    position: { x: 1, y: 1 },
    iconUrl: '/skills/bench_press.png'
  }
  // ... 더 많은 스킬
];
```

### 4.2 스킬 해금 로직

```typescript
async function checkSkillUnlocks(
  userId: string,
  bodyPart: string,
  currentLevel: number
): Promise<Skill[]> {
  // 1. 해당 부위의 모든 스킬 가져오기
  const allSkills = await getSkillsByBodyPart(bodyPart);

  // 2. 이미 해금한 스킬 가져오기
  const unlockedSkillIds = await getUserUnlockedSkills(userId, bodyPart);

  // 3. 사용자의 운동 기록 가져오기
  const workoutRecords = await getUserWorkoutRecords(userId, bodyPart);

  const newlyUnlocked: Skill[] = [];

  for (const skill of allSkills) {
    // 이미 해금했으면 스킵
    if (unlockedSkillIds.includes(skill.id)) continue;

    // 해금 조건 체크
    const canUnlock = checkSkillRequirements(
      skill,
      currentLevel,
      unlockedSkillIds,
      workoutRecords
    );

    if (canUnlock) {
      // 스킬 해금!
      await unlockSkill(userId, skill.id);
      newlyUnlocked.push(skill);
    }
  }

  return newlyUnlocked;
}

function checkSkillRequirements(
  skill: Skill,
  userLevel: number,
  unlockedSkillIds: number[],
  workoutRecords: WorkoutRecord[]
): boolean {
  const req = skill.requirements;

  // 레벨 체크
  if (req.level && userLevel < req.level) return false;

  // 선행 스킬 체크
  if (req.prerequisiteSkills) {
    const hasAllPrerequisites = req.prerequisiteSkills.every(
      skillId => unlockedSkillIds.includes(skillId)
    );
    if (!hasAllPrerequisites) return false;
  }

  // 무게/횟수 체크
  if (req.weight || req.reps) {
    const hasAchieved = workoutRecords.some(record =>
      record.exerciseId === skill.exerciseId &&
      (!req.weight || record.weight >= req.weight) &&
      (!req.reps || record.reps >= req.reps)
    );
    if (!hasAchieved) return false;
  }

  return true;
}
```

### 4.3 스킬트리 UI 렌더링

```typescript
interface SkillNode {
  skill: Skill;
  isUnlocked: boolean;
  isAvailable: boolean;  // 해금 가능한 상태
  isLocked: boolean;     // 아직 조건 미달
  connections: number[]; // 연결된 스킬 ID들
}

function buildSkillTree(
  skills: Skill[],
  unlockedSkillIds: number[],
  userLevel: number,
  workoutRecords: WorkoutRecord[]
): SkillNode[] {
  return skills.map(skill => {
    const isUnlocked = unlockedSkillIds.includes(skill.id);
    const isAvailable = !isUnlocked && checkSkillRequirements(
      skill,
      userLevel,
      unlockedSkillIds,
      workoutRecords
    );
    const isLocked = !isUnlocked && !isAvailable;

    const connections = skill.requirements.prerequisiteSkills || [];

    return {
      skill,
      isUnlocked,
      isAvailable,
      isLocked,
      connections
    };
  });
}
```

---

## 5. 맵 탐험 시스템

### 5.1 맵 구조

```typescript
interface MapStage {
  id: number;
  code: string;
  name: string;
  mapType: 'none' | 'earth' | 'fire' | 'wind' | 'water' | 'mind';
  chapter: number;
  stage: number;

  // 해금 조건
  requirements: {
    totalLevel?: number;
    prerequisiteStage?: number;
  };

  // 클리어 조건
  clearConditions: {
    type: 'workout_count' | 'exp_gain' | 'specific_exercise';
    target: number;
    exerciseId?: number;
    bodyPart?: string;
  }[];

  // 보상
  rewards: {
    exp: number;
    items?: any[];
  };

  position: { x: number; y: number };
}

// 예시: 무속성 과정 (기초)
const NONE_ATTRIBUTE_MAP: MapStage[] = [
  {
    id: 1,
    code: 'stage_0_1',
    name: '운동의 필요성',
    mapType: 'none',
    chapter: 1,
    stage: 1,
    requirements: {}, // 시작 스테이지
    clearConditions: [
      { type: 'workout_count', target: 3 }
    ],
    rewards: { exp: 500 },
    position: { x: 0, y: 0 }
  },
  {
    id: 2,
    code: 'stage_0_2',
    name: '기초 체력 다지기',
    mapType: 'none',
    chapter: 1,
    stage: 2,
    requirements: { prerequisiteStage: 1 },
    clearConditions: [
      { type: 'workout_count', target: 5 },
      { type: 'exp_gain', target: 2000 }
    ],
    rewards: { exp: 1000 },
    position: { x: 1, y: 0 }
  }
  // ... 더 많은 스테이지
];

// 속성 과정 맵 (땅, 불, 바람, 물, 마음)
const EARTH_ATTRIBUTE_MAP: MapStage[] = [
  {
    id: 101,
    code: 'earth_1_1',
    name: '보디빌딩 입문',
    mapType: 'earth',
    chapter: 1,
    stage: 1,
    requirements: { totalLevel: 5 },
    clearConditions: [
      { type: 'specific_exercise', target: 10, exerciseId: 201, bodyPart: 'chest' }
    ],
    rewards: { exp: 2000 },
    position: { x: 0, y: 0 }
  }
  // ...
];
```

### 5.2 맵 진행 로직

```typescript
interface MapProgress {
  stageId: number;
  status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
  progress: {
    workoutCount?: number;
    expGained?: number;
  };
}

async function updateMapProgress(
  userId: string,
  workoutRecord: WorkoutRecord
): Promise<void> {
  // 1. 현재 진행 중인 스테이지들 가져오기
  const activeStages = await getUserActiveMapStages(userId);

  for (const stage of activeStages) {
    const stageData = await getMapStage(stage.stageId);
    let progressMade = false;

    // 2. 클리어 조건별 진행도 업데이트
    for (const condition of stageData.clearConditions) {
      switch (condition.type) {
        case 'workout_count':
          stage.progress.workoutCount = (stage.progress.workoutCount || 0) + 1;
          progressMade = true;
          break;

        case 'exp_gain':
          stage.progress.expGained = (stage.progress.expGained || 0) + workoutRecord.expGained;
          progressMade = true;
          break;

        case 'specific_exercise':
          if (workoutRecord.exerciseId === condition.exerciseId) {
            stage.progress.workoutCount = (stage.progress.workoutCount || 0) + 1;
            progressMade = true;
          }
          break;
      }
    }

    // 3. 클리어 체크
    if (progressMade) {
      const isCleared = checkStageClear(stageData, stage.progress);

      if (isCleared) {
        await completeStage(userId, stage.stageId);

        // 보상 지급
        await giveStageRewards(userId, stageData.rewards);

        // 다음 스테이지 해금
        await unlockNextStages(userId, stage.stageId);
      } else {
        await updateStageProgress(userId, stage.stageId, stage.progress);
      }
    }
  }
}

function checkStageClear(stage: MapStage, progress: any): boolean {
  return stage.clearConditions.every(condition => {
    switch (condition.type) {
      case 'workout_count':
        return (progress.workoutCount || 0) >= condition.target;

      case 'exp_gain':
        return (progress.expGained || 0) >= condition.target;

      case 'specific_exercise':
        return (progress.workoutCount || 0) >= condition.target;

      default:
        return false;
    }
  });
}
```

---

## 6. 퀘스트 시스템

### 6.1 일일 퀘스트

```typescript
interface DailyQuest {
  id: number;
  code: string;
  name: string;
  description: string;

  questType: 'workout_count' | 'specific_bodypart' | 'calories_burned' | 'streak';
  targetValue: number;
  targetBodyPart?: string;

  rewards: {
    exp: number;
    items?: any[];
  };

  recurrence: 'daily' | 'weekly';
}

// 일일 퀘스트 풀
const DAILY_QUEST_POOL: DailyQuest[] = [
  {
    id: 1,
    code: 'daily_workout_3',
    name: '오늘의 운동',
    description: '오늘 3회 운동하기',
    questType: 'workout_count',
    targetValue: 3,
    rewards: { exp: 300 },
    recurrence: 'daily'
  },
  {
    id: 2,
    code: 'daily_chest_workout',
    name: '가슴의 날',
    description: '가슴 운동 2회 완료하기',
    questType: 'specific_bodypart',
    targetValue: 2,
    targetBodyPart: 'chest',
    rewards: { exp: 500 },
    recurrence: 'daily'
  },
  {
    id: 3,
    code: 'daily_calories_300',
    name: '칼로리 소모',
    description: '300kcal 소모하기',
    questType: 'calories_burned',
    targetValue: 300,
    rewards: { exp: 400 },
    recurrence: 'daily'
  }
];
```

### 6.2 퀘스트 할당 로직 (매일 자정)

```typescript
async function assignDailyQuests(userId: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  // 오늘 이미 할당했으면 스킵
  const existing = await getUserQuestsForDate(userId, today);
  if (existing.length > 0) return;

  // 랜덤으로 3개 퀘스트 선택
  const selectedQuests = selectRandomQuests(DAILY_QUEST_POOL, 3);

  for (const quest of selectedQuests) {
    await createUserQuest({
      userId,
      questId: quest.id,
      assignedDate: today,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24시간 후
      progress: 0
    });
  }
}

function selectRandomQuests(pool: DailyQuest[], count: number): DailyQuest[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
```

### 6.3 퀘스트 진행 업데이트

```typescript
async function updateQuestProgress(
  userId: string,
  workoutRecord: WorkoutRecord
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const activeQuests = await getUserActiveQuests(userId, today);

  for (const userQuest of activeQuests) {
    const quest = await getDailyQuest(userQuest.questId);
    let progressIncrement = 0;

    switch (quest.questType) {
      case 'workout_count':
        progressIncrement = 1;
        break;

      case 'specific_bodypart':
        if (workoutRecord.bodyPart === quest.targetBodyPart) {
          progressIncrement = 1;
        }
        break;

      case 'calories_burned':
        progressIncrement = workoutRecord.caloriesBurned;
        break;
    }

    if (progressIncrement > 0) {
      const newProgress = userQuest.progress + progressIncrement;

      await updateUserQuestProgress(userQuest.id, newProgress);

      // 퀘스트 완료 체크
      if (newProgress >= quest.targetValue && !userQuest.isCompleted) {
        await completeUserQuest(userQuest.id);
        await giveQuestRewards(userId, quest.rewards);
      }
    }
  }
}
```

---

## 7. 업적 시스템

### 7.1 업적 정의

```typescript
interface Achievement {
  id: number;
  code: string;
  name: string;
  description: string;

  category: 'workout' | 'level' | 'streak' | 'social' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';

  conditionType: 'total_workouts' | 'streak_days' | 'level_reached' | 'skill_unlocked' | 'stage_cleared';
  conditionValue: number;

  rewards: {
    exp: number;
    title?: string;
  };

  iconUrl: string;
  badgeUrl: string;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 1,
    code: 'first_workout',
    name: '첫 걸음',
    description: '첫 운동 기록 달성',
    category: 'workout',
    tier: 'bronze',
    conditionType: 'total_workouts',
    conditionValue: 1,
    rewards: { exp: 100, title: '헬게이터 입문자' },
    iconUrl: '/achievements/first_workout.png',
    badgeUrl: '/badges/first_workout.png'
  },
  {
    id: 2,
    code: 'workout_veteran',
    name: '헬린이 탈출',
    description: '총 100회 운동 달성',
    category: 'workout',
    tier: 'silver',
    conditionType: 'total_workouts',
    conditionValue: 100,
    rewards: { exp: 5000, title: '헬스 베테랑' },
    iconUrl: '/achievements/veteran.png',
    badgeUrl: '/badges/veteran.png'
  },
  {
    id: 3,
    code: 'streak_7days',
    name: '7일 연속 출석',
    description: '7일 연속으로 운동하기',
    category: 'streak',
    tier: 'silver',
    conditionType: 'streak_days',
    conditionValue: 7,
    rewards: { exp: 2000, title: '성실왕' },
    iconUrl: '/achievements/streak_7.png',
    badgeUrl: '/badges/streak_7.png'
  },
  {
    id: 4,
    code: 'level_50',
    name: '반백 돌파',
    description: '전체 레벨 50 달성',
    category: 'level',
    tier: 'gold',
    conditionType: 'level_reached',
    conditionValue: 50,
    rewards: { exp: 10000, title: '헬스의 화신' },
    iconUrl: '/achievements/level_50.png',
    badgeUrl: '/badges/level_50.png'
  }
];
```

### 7.2 업적 체크 로직

```typescript
async function checkAchievements(userId: string): Promise<Achievement[]> {
  // 1. 사용자 통계 가져오기
  const stats = await getUserStats(userId);

  // 2. 아직 달성하지 않은 업적들
  const unachieved = await getUnachievedAchievements(userId);

  const newlyAchieved: Achievement[] = [];

  for (const achievement of unachieved) {
    let isAchieved = false;

    switch (achievement.conditionType) {
      case 'total_workouts':
        isAchieved = stats.totalWorkoutCount >= achievement.conditionValue;
        break;

      case 'streak_days':
        isAchieved = stats.currentStreak >= achievement.conditionValue;
        break;

      case 'level_reached':
        isAchieved = stats.totalLevel >= achievement.conditionValue;
        break;

      case 'skill_unlocked':
        isAchieved = stats.unlockedSkillCount >= achievement.conditionValue;
        break;

      case 'stage_cleared':
        isAchieved = stats.clearedStageCount >= achievement.conditionValue;
        break;
    }

    if (isAchieved) {
      await unlockAchievement(userId, achievement.id);
      await giveAchievementRewards(userId, achievement.rewards);
      newlyAchieved.push(achievement);
    }
  }

  return newlyAchieved;
}
```

---

## 8. 통합 플로우: 운동 기록 → 모든 시스템 업데이트

```typescript
async function recordWorkout(userId: string, workoutInput: WorkoutInput): Promise<WorkoutResult> {
  // 1. RM 분석
  const rmAnalysis = calculateWorkoutExp(workoutInput);

  // 2. 운동 기록 저장
  const workoutRecord = await saveWorkoutRecord({
    userId,
    ...workoutInput,
    calculated1RM: rmAnalysis.calculated1RM,
    grade: rmAnalysis.grade,
    expGained: rmAnalysis.totalExp,
    caloriesBurned: rmAnalysis.calories
  });

  // 3. 경험치 분배
  const expDist = distributeExp(rmAnalysis.totalExp);

  // 4. 부위별 경험치 적용 & 레벨업 체크
  const levelUpResult = await applyExpAndCheckLevelUp(
    userId,
    workoutInput.bodyPart,
    expDist.bodyPartExp
  );

  // 5. 전체 경험치 적용
  await applyCharacterExp(userId, expDist.totalExp);

  // 6. 스킬 해금 체크 (레벨업 시 이미 체크되지만 무게/횟수 조건 재체크)
  const newSkills = await checkSkillUnlocks(
    userId,
    workoutInput.bodyPart,
    levelUpResult.newLevel
  );

  // 7. 맵 진행 업데이트
  await updateMapProgress(userId, workoutRecord);

  // 8. 퀘스트 진행 업데이트
  await updateQuestProgress(userId, workoutRecord);

  // 9. 업적 체크
  const newAchievements = await checkAchievements(userId);

  // 10. 통계 업데이트
  await updateUserStats(userId, {
    totalWorkoutCount: +1,
    totalCaloriesBurned: +rmAnalysis.calories
  });

  // 11. 결과 반환
  return {
    workoutRecord,
    rmAnalysis,
    levelUp: levelUpResult,
    newSkills,
    newAchievements,
    expGained: {
      bodyPart: expDist.bodyPartExp,
      total: expDist.totalExp
    }
  };
}
```

---

## 9. 밸런싱 고려사항

### 9.1 경험치 곡선
- **초반 (Lv1-10)**: 빠른 레벨업으로 성취감
- **중반 (Lv11-30)**: 점진적 난이도 상승
- **후반 (Lv31-50)**: 긴 레벨업 주기, 고급 컨텐츠 해금
- **극후반 (Lv51+)**: 엔드 컨텐츠, 랭킹 경쟁

### 9.2 스킬트리 밸런스
- 각 티어마다 2-3개 분기점 제공
- 막힌 느낌 방지: 항상 해금 가능한 스킬 2개 이상
- 핵심 스킬(예: 벤치프레스)은 중간 티어에 배치

### 9.3 맵 난이도
- 무속성 맵: 튜토리얼 성격, 쉬운 클리어 조건
- 속성 맵: 전문화된 커리큘럼, 중간 난이도
- 보상: 시간 투자 대비 적절한 경험치

---

**다음 단계**: API_DESIGN.md에서 REST API 엔드포인트 설계
