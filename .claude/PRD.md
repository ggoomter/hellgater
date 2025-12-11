# HELLGATER - Product Requirements Document (PRD)

**Version**: 1.0
**Last Updated**: 2025-01-17
**Status**: Draft
**Follows**: TDD & Tidy First Principles

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Success Metrics](#2-success-metrics)
3. [User Personas](#3-user-personas)
4. [User Stories & Acceptance Criteria](#4-user-stories--acceptance-criteria)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [MVP Scope & Development Phases](#7-mvp-scope--development-phases)
8. [Testing Strategy](#8-testing-strategy)
9. [Out of Scope](#9-out-of-scope)

---

## 1. Product Vision

### Vision Statement
**Transform fitness tracking into an engaging RPG experience where every workout advances your character.**

헬스를 RPG 게임처럼! 운동 기록과 관리를 게임화(Gamification)하여 재미있게 만드는 웹/앱 서비스입니다.

### Problem Statement
- 기존 운동 기록 앱들은 단순 데이터 기록에 그쳐 지루함
- 운동 초보자들의 높은 이탈률 (3개월 내 70%)
- 운동 동기부여 부족 및 목표 불명확

### Solution
- **RPG 게임 메커니즘**: 경험치, 레벨업, 스킬트리, 맵 탐험
- **즉각적 피드백**: 운동 → 경험치 → 레벨업 → 스킬 해금
- **25주 커리큘럼**: 검증된 운동 프로그램을 맵 형태로 제공
- **커뮤니티 & 경쟁**: 랭킹, 친구 시스템으로 사회적 동기부여

### Target Users
- **Primary**: 20-40대 헬스장 이용자 (초보~중급)
- **Secondary**: 홈트레이닝 유저, 운동 재활자
- **Target Market Size**: 한국 헬스장 이용자 약 500만명

---

## 2. Success Metrics

### Key Performance Indicators (KPIs)

#### MVP Launch (First 3 Months)
- **User Acquisition**: 1,000 active users
- **Retention**: 30-day retention > 40%
- **Engagement**: Average 3 workouts/week per user
- **Feature Adoption**: 70% of users reach Level 5

#### 6-Month Goals
- **Users**: 10,000 MAU (Monthly Active Users)
- **Retention**: 30-day retention > 50%
- **Workout Records**: Average 100,000 workouts/month
- **Premium Conversion**: 5% free → premium

#### 12-Month Goals
- **Users**: 50,000 MAU
- **Revenue**: $50,000 MRR (Monthly Recurring Revenue)
- **Community**: 10,000 posts/month
- **NPS Score**: > 50

### Testable Metrics (per Phase)

**Phase 1 (MVP)**:
- ✅ User can complete registration in < 2 minutes
- ✅ 95% of workout records saved successfully
- ✅ Level-up notification appears within 1 second
- ✅ API response time < 500ms (p95)

**Phase 2 (Gamification)**:
- ✅ Skill unlock happens within 2 seconds of meeting requirements
- ✅ Map progress updates within 3 seconds of workout completion
- ✅ Daily quest assignment completes by 00:01 KST

**Phase 3 (Community)**:
- ✅ Feed loads in < 2 seconds
- ✅ Post creation completes in < 3 seconds
- ✅ Leaderboard updates within 5 minutes of workout record

---

## 3. User Personas

### Persona 1: "헬린이 민수" (Beginner Minsoo)
- **Age**: 28
- **Occupation**: Office worker
- **Fitness Level**: Beginner (3 months experience)
- **Goals**: Build muscle, lose weight, stay consistent
- **Pain Points**:
  - Doesn't know which exercises to do
  - Loses motivation after 2-3 weeks
  - Confused by gym equipment
- **Needs**:
  - Clear workout guidance
  - Visual progress tracking
  - Small, achievable milestones

### Persona 2: "중급자 지현" (Intermediate Jihyun)
- **Age**: 32
- **Occupation**: Marketing manager
- **Fitness Level**: Intermediate (2 years experience)
- **Goals**: Increase PRs, optimize workout routine
- **Pain Points**:
  - Bored with routine workouts
  - Plateau in progress
  - Lacks structure
- **Needs**:
  - Advanced workout programs
  - Performance analytics
  - Community to share achievements

### Persona 3: "경쟁자 준호" (Competitive Junho)
- **Age**: 25
- **Occupation**: Personal trainer
- **Fitness Level**: Advanced
- **Goals**: Compete in rankings, showcase skills
- **Pain Points**:
  - Current apps too simple
  - No social features
  - Can't share achievements effectively
- **Needs**:
  - Leaderboards
  - Social proof (badges, achievements)
  - Content creation tools

---

## 4. User Stories & Acceptance Criteria

### Epic 1: Authentication & Onboarding

#### US-1.1: User Registration
**As a** new user
**I want to** create an account with email and password
**So that** I can start tracking my workouts

**Acceptance Criteria**:
- ✅ User can register with valid email and password (8+ chars)
- ✅ System validates email format (regex: `^[^\s@]+@[^\s@]+\.[^\s@]+$`)
- ✅ Password must contain at least 1 uppercase, 1 lowercase, 1 number
- ✅ System rejects duplicate email addresses
- ✅ User receives JWT access token (15min expiry) and refresh token (7d expiry)
- ✅ User profile is created with default values
- ✅ Registration completes in < 3 seconds

**Test Cases**:
```typescript
describe('User Registration', () => {
  test('should register user with valid credentials', async () => {
    const response = await POST('/auth/register', {
      email: 'test@example.com',
      password: 'Test1234',
      username: 'testuser'
    });
    expect(response.status).toBe(201);
    expect(response.data.tokens.accessToken).toBeDefined();
  });

  test('should reject duplicate email', async () => {
    await createUser({ email: 'existing@example.com' });
    const response = await POST('/auth/register', {
      email: 'existing@example.com',
      password: 'Test1234'
    });
    expect(response.status).toBe(409);
    expect(response.error.code).toBe('USER_ALREADY_EXISTS');
  });

  test('should reject weak password', async () => {
    const response = await POST('/auth/register', {
      email: 'test@example.com',
      password: 'weak'
    });
    expect(response.status).toBe(400);
  });
});
```

---

#### US-1.2: User Login
**As a** registered user
**I want to** log in with my credentials
**So that** I can access my workout data

**Acceptance Criteria**:
- ✅ User can login with correct email and password
- ✅ System returns user profile + tokens on success
- ✅ System returns 401 error for invalid credentials
- ✅ Login completes in < 2 seconds
- ✅ Refresh token is stored in database with device info
- ✅ Maximum 5 active refresh tokens per user

**Test Cases**:
```typescript
describe('User Login', () => {
  test('should login with valid credentials', async () => {
    const user = await createUser({ email: 'user@example.com', password: 'Test1234' });
    const response = await POST('/auth/login', {
      email: 'user@example.com',
      password: 'Test1234'
    });
    expect(response.status).toBe(200);
    expect(response.data.user.id).toBe(user.id);
    expect(response.data.tokens).toBeDefined();
  });

  test('should reject invalid password', async () => {
    await createUser({ email: 'user@example.com', password: 'Test1234' });
    const response = await POST('/auth/login', {
      email: 'user@example.com',
      password: 'WrongPassword'
    });
    expect(response.status).toBe(401);
  });
});
```

---

#### US-1.3: Character Creation
**As a** new user
**I want to** create my workout character
**So that** I can see my character grow as I exercise

**Acceptance Criteria**:
- ✅ User can create character after registration (first-time only)
- ✅ Character starts at Level 1 with 0 EXP
- ✅ All 7 body parts initialize at Level 1
- ✅ Character has 9 default stats (all start at 0)
- ✅ Character creation is atomic (fails if any part fails)
- ✅ Character cannot be created twice for same user

**Test Cases**:
```typescript
describe('Character Creation', () => {
  test('should create character with default values', async () => {
    const user = await createUser();
    const response = await POST('/characters', {
      characterModel: 'default'
    }, { userId: user.id });

    expect(response.status).toBe(201);
    expect(response.data.totalLevel).toBe(1);
    expect(response.data.bodyParts.length).toBe(7);
    expect(response.data.bodyParts.every(bp => bp.level === 1)).toBe(true);
  });

  test('should reject duplicate character creation', async () => {
    const user = await createUser();
    await createCharacter(user.id);
    const response = await POST('/characters', {}, { userId: user.id });
    expect(response.status).toBe(409);
  });
});
```

---

### Epic 2: Workout Recording

#### US-2.1: Record Workout
**As a** user
**I want to** record my workout (exercise, weight, reps, sets)
**So that** I can track my progress and gain experience

**Acceptance Criteria**:
- ✅ User can select exercise from predefined list
- ✅ User can input weight (kg), reps (1-50), sets (1-10)
- ✅ System calculates 1RM using formula: `1RM = weight × (1 + reps / 30)`
- ✅ System evaluates grade (Bronze → Challenger) based on bodyweight ratio
- ✅ System calculates experience points based on grade multiplier
- ✅ Workout record is saved to database
- ✅ Response includes: workout record, exp gained, level-up result, unlocked skills
- ✅ Recording completes in < 3 seconds

**Test Cases**:
```typescript
describe('Workout Recording', () => {
  test('should record workout and calculate EXP correctly', async () => {
    const user = await createUserWithCharacter({ weight: 70 });
    const response = await POST('/workouts', {
      exerciseId: 101, // Bench Press
      bodyPart: 'chest',
      weight: 60,
      reps: 10,
      sets: 3,
      workoutDate: '2024-01-15'
    }, { userId: user.id });

    expect(response.status).toBe(201);
    expect(response.data.workout.calculated1RM).toBeCloseTo(75, 1);
    expect(response.data.workout.expGained).toBeGreaterThan(0);
    expect(response.data.results.expGained.bodyPart).toBeGreaterThan(0);
  });

  test('should apply grade multiplier correctly', async () => {
    const user = await createUserWithCharacter({ weight: 70 });
    const goldResponse = await recordWorkout(user.id, {
      weight: 60, reps: 10, sets: 3 // Gold grade
    });
    const silverResponse = await recordWorkout(user.id, {
      weight: 40, reps: 10, sets: 3 // Silver grade
    });

    expect(goldResponse.expGained).toBeGreaterThan(silverResponse.expGained);
  });

  test('should reject invalid workout data', async () => {
    const user = await createUser();
    const response = await POST('/workouts', {
      exerciseId: 101,
      weight: -10, // Invalid: negative weight
      reps: 10,
      sets: 3
    }, { userId: user.id });

    expect(response.status).toBe(400);
  });
});
```

---

#### US-2.2: Level Up
**As a** user
**I want to** level up my body parts when I gain enough EXP
**So that** I feel progression and unlock new content

**Acceptance Criteria**:
- ✅ Body part levels up when `currentExp >= requiredExp`
- ✅ Required EXP = `1000 × (1.15 ^ (level - 1))`
- ✅ Overflow EXP carries over to next level
- ✅ Multiple level-ups can occur in one workout
- ✅ Total character level = average of all 7 body part levels (rounded down)
- ✅ Level-up triggers skill unlock check
- ✅ Level-up notification includes rewards

**Test Cases**:
```typescript
describe('Level Up System', () => {
  test('should level up when EXP threshold reached', async () => {
    const user = await createUserWithCharacter();
    await setBodyPartExp(user.id, 'chest', { level: 1, currentExp: 950 });

    const response = await recordWorkout(user.id, {
      bodyPart: 'chest',
      expGained: 100 // 950 + 100 = 1050, exceeds 1000
    });

    expect(response.data.results.levelUp.didLevelUp).toBe(true);
    expect(response.data.results.levelUp.newLevel).toBe(2);
    expect(response.data.results.levelUp.overflow).toBe(50);
  });

  test('should handle multiple level-ups', async () => {
    const user = await createUserWithCharacter();
    await setBodyPartExp(user.id, 'chest', { level: 1, currentExp: 900 });

    const response = await recordWorkout(user.id, {
      bodyPart: 'chest',
      expGained: 3000 // Enough for multiple levels
    });

    expect(response.data.results.levelUp.newLevel).toBeGreaterThan(2);
  });

  test('should update total character level', async () => {
    const user = await createUserWithCharacter();
    // Set all body parts to level 5
    for (const part of BODY_PARTS) {
      await setBodyPartLevel(user.id, part, 5);
    }

    const character = await getCharacter(user.id);
    expect(character.totalLevel).toBe(5);
  });
});
```

---

### Epic 3: Skill Tree System

#### US-3.1: View Skill Tree
**As a** user
**I want to** see a visual skill tree for each body part
**So that** I know what exercises I can unlock next

**Acceptance Criteria**:
- ✅ User can view skill tree filtered by body part
- ✅ Skills display in tree structure with connections
- ✅ Each skill shows: name, tier, requirements, unlock status
- ✅ Unlocked skills are highlighted
- ✅ Available skills (ready to unlock) are indicated
- ✅ Locked skills show requirements clearly
- ✅ Skill tree loads in < 2 seconds

**Test Cases**:
```typescript
describe('Skill Tree Viewing', () => {
  test('should return skill tree for body part', async () => {
    const user = await createUserWithCharacter();
    const response = await GET('/skills?bodyPart=chest', { userId: user.id });

    expect(response.status).toBe(200);
    expect(response.data.skills.length).toBeGreaterThan(0);
    expect(response.data.skills[0]).toMatchObject({
      id: expect.any(Number),
      name: expect.any(String),
      tier: expect.any(String),
      isUnlocked: expect.any(Boolean),
      isAvailable: expect.any(Boolean)
    });
  });

  test('should mark prerequisite-met skills as available', async () => {
    const user = await createUserWithCharacter();
    await unlockSkill(user.id, 1); // Unlock "Pushup 15 reps"

    const response = await GET('/skills?bodyPart=chest', { userId: user.id });
    const benchPushup = response.data.skills.find(s => s.code === 'bench_pushup');

    expect(benchPushup.isAvailable).toBe(true);
  });
});
```

---

#### US-3.2: Unlock Skill
**As a** user
**I want to** automatically unlock skills when I meet requirements
**So that** I progress through the workout curriculum

**Acceptance Criteria**:
- ✅ Skill unlocks when ALL requirements are met:
  - Level requirement (if specified)
  - Prerequisite skills (if specified)
  - Weight/reps achievement (if specified)
- ✅ Skill unlock check triggers on:
  - Level-up
  - Workout record creation
- ✅ Newly unlocked skills appear in response
- ✅ Unlock notification includes skill details
- ✅ Same skill cannot be unlocked twice

**Test Cases**:
```typescript
describe('Skill Unlocking', () => {
  test('should unlock skill when requirements met', async () => {
    const user = await createUserWithCharacter();
    await setBodyPartLevel(user.id, 'chest', 5);
    await unlockSkill(user.id, 1); // Prerequisite

    const response = await recordWorkout(user.id, {
      exerciseId: 104, // Bench press
      bodyPart: 'chest',
      weight: 15,
      reps: 15,
      sets: 1
    });

    const unlockedSkills = response.data.results.unlockedSkills;
    expect(unlockedSkills.some(s => s.code === 'bench_press_15kg_15reps')).toBe(true);
  });

  test('should not unlock skill if level requirement not met', async () => {
    const user = await createUserWithCharacter();
    await setBodyPartLevel(user.id, 'chest', 3); // Need level 5

    const response = await recordWorkout(user.id, {
      exerciseId: 104,
      weight: 15,
      reps: 15
    });

    expect(response.data.results.unlockedSkills).not.toContainEqual(
      expect.objectContaining({ code: 'bench_press_15kg_15reps' })
    );
  });
});
```

---

### Epic 4: Map Exploration

#### US-4.1: View Map
**As a** user
**I want to** see all available maps and stages
**So that** I can follow a structured workout program

**Acceptance Criteria**:
- ✅ User can view all maps (none, earth, fire, wind, water, mind)
- ✅ Each map shows chapters and stages
- ✅ Stages display status: locked, unlocked, in_progress, completed
- ✅ Current progress is shown for in-progress stages
- ✅ Clear conditions are visible
- ✅ Locked stages show unlock requirements
- ✅ Map loads in < 2 seconds

**Test Cases**:
```typescript
describe('Map Viewing', () => {
  test('should return all maps with stage statuses', async () => {
    const user = await createUserWithCharacter();
    await completeStage(user.id, 1); // Complete stage 1
    await startStage(user.id, 2); // Start stage 2

    const response = await GET('/maps', { userId: user.id });

    expect(response.data.maps).toHaveLength(6); // 6 map types

    const noneMap = response.data.maps.find(m => m.type === 'none');
    expect(noneMap.stages[0].status).toBe('completed');
    expect(noneMap.stages[1].status).toBe('in_progress');
  });
});
```

---

#### US-4.2: Progress Through Map
**As a** user
**I want to** progress through map stages by completing workouts
**So that** I follow the 25-week fitness curriculum

**Acceptance Criteria**:
- ✅ Stage progress updates after each workout
- ✅ Clear conditions types:
  - `workout_count`: Complete N workouts
  - `exp_gain`: Gain N experience points
  - `specific_exercise`: Do specific exercise N times
- ✅ Stage completes when ALL conditions met
- ✅ Completion triggers:
  - Reward distribution (EXP, items)
  - Next stage unlock
  - Achievement check
- ✅ Progress updates within 3 seconds

**Test Cases**:
```typescript
describe('Map Progression', () => {
  test('should update stage progress after workout', async () => {
    const user = await createUserWithCharacter();
    await startStage(user.id, 2); // "기초 체력 다지기": 5 workouts, 2000 exp

    const response = await recordWorkout(user.id, {
      bodyPart: 'chest',
      weight: 50,
      reps: 10,
      sets: 3
    });

    const mapProgress = response.data.results.mapProgress;
    expect(mapProgress.stageName).toBe('기초 체력 다지기');
    expect(mapProgress.progress.workoutCount).toBe(1);
    expect(mapProgress.progress.expGained).toBeGreaterThan(0);
  });

  test('should complete stage when conditions met', async () => {
    const user = await createUserWithCharacter();
    await setStageProgress(user.id, 2, {
      workoutCount: 4,
      expGained: 1900
    });

    const response = await recordWorkout(user.id, {
      expGained: 150 // Total: 2050 exp, 5 workouts
    });

    const userProgress = await getStageProgress(user.id, 2);
    expect(userProgress.status).toBe('completed');
    expect(userProgress.completedAt).toBeDefined();
  });

  test('should unlock next stage after completion', async () => {
    const user = await createUserWithCharacter();
    await completeStage(user.id, 2);

    const stage3 = await getStageProgress(user.id, 3);
    expect(stage3.status).toBe('unlocked');
  });
});
```

---

### Epic 5: Daily Quests & Achievements

#### US-5.1: Receive Daily Quests
**As a** user
**I want to** receive daily quests every day
**So that** I have daily goals to work towards

**Acceptance Criteria**:
- ✅ 3 random quests assigned daily at 00:00 KST
- ✅ Quest types: workout_count, specific_bodypart, calories_burned
- ✅ Each quest shows: name, description, progress, target, rewards
- ✅ Quests expire after 24 hours
- ✅ User can view active quests
- ✅ Quest assignment runs automatically (cron job)

**Test Cases**:
```typescript
describe('Daily Quests', () => {
  test('should assign 3 quests at midnight', async () => {
    const user = await createUserWithCharacter();
    await runDailyQuestAssignment(); // Simulate cron job

    const quests = await getUserDailyQuests(user.id);
    expect(quests).toHaveLength(3);
    expect(quests.every(q => q.assignedDate === getTodayDate())).toBe(true);
  });

  test('should not assign quests if already assigned today', async () => {
    const user = await createUserWithCharacter();
    await runDailyQuestAssignment();
    await runDailyQuestAssignment(); // Run again

    const quests = await getUserDailyQuests(user.id);
    expect(quests).toHaveLength(3); // Still only 3
  });
});
```

---

#### US-5.2: Complete Quest
**As a** user
**I want to** complete quests by working out
**So that** I earn rewards

**Acceptance Criteria**:
- ✅ Quest progress updates after each workout
- ✅ Quest completes when progress >= target
- ✅ User can claim rewards for completed quests
- ✅ Rewards include: EXP, items (future)
- ✅ Same quest cannot be claimed twice
- ✅ Completed quests show completion time

**Test Cases**:
```typescript
describe('Quest Completion', () => {
  test('should update quest progress after workout', async () => {
    const user = await createUserWithCharacter();
    await assignQuest(user.id, { type: 'workout_count', target: 3 });

    const response = await recordWorkout(user.id, {});
    const quest = await getUserQuest(user.id, 'daily_workout_3');

    expect(quest.progress).toBe(1);
  });

  test('should mark quest as completed when target reached', async () => {
    const user = await createUserWithCharacter();
    await assignQuest(user.id, { type: 'workout_count', target: 3 });
    await setQuestProgress(user.id, quest.id, 2);

    await recordWorkout(user.id, {});
    const quest = await getUserQuest(user.id, quest.id);

    expect(quest.isCompleted).toBe(true);
    expect(quest.completedAt).toBeDefined();
  });

  test('should allow claiming rewards for completed quest', async () => {
    const user = await createUserWithCharacter();
    const quest = await completeQuest(user.id, { rewards: { exp: 500 } });

    const response = await POST(`/quests/${quest.id}/claim`, {}, { userId: user.id });

    expect(response.status).toBe(200);
    expect(response.data.rewards.exp).toBe(500);

    const updatedQuest = await getUserQuest(user.id, quest.id);
    expect(updatedQuest.rewardClaimed).toBe(true);
  });
});
```

---

#### US-5.3: Unlock Achievements
**As a** user
**I want to** unlock achievements when I reach milestones
**So that** I feel accomplished and show off my progress

**Acceptance Criteria**:
- ✅ Achievements unlock automatically when conditions met
- ✅ Achievement types: total_workouts, streak_days, level_reached, skill_unlocked
- ✅ Each achievement has: name, description, icon, badge, tier, rewards
- ✅ User can view all achievements (locked and unlocked)
- ✅ Achievement progress is tracked
- ✅ Unlock notification includes badge and rewards

**Test Cases**:
```typescript
describe('Achievements', () => {
  test('should unlock achievement when condition met', async () => {
    const user = await createUserWithCharacter();
    await createWorkoutRecords(user.id, 99); // Create 99 records

    const response = await recordWorkout(user.id, {}); // 100th workout

    const newAchievements = response.data.results.newAchievements;
    expect(newAchievements.some(a => a.code === 'workout_veteran')).toBe(true);
  });

  test('should track achievement progress', async () => {
    const user = await createUserWithCharacter();
    await createWorkoutRecords(user.id, 45);

    const achievements = await getUserAchievements(user.id);
    const veteranAchievement = achievements.find(a => a.code === 'workout_veteran');

    expect(veteranAchievement.progress).toBe(45);
    expect(veteranAchievement.targetValue).toBe(100);
    expect(veteranAchievement.isCompleted).toBe(false);
  });
});
```

---

### Epic 6: Community & Social

#### US-6.1: Create Post
**As a** user
**I want to** share my workout achievements in the community
**So that** I can inspire others and get recognition

**Acceptance Criteria**:
- ✅ User can create post with title, content, images
- ✅ User can attach workout record to post
- ✅ User can select category (achievement, question, tips)
- ✅ Post is immediately visible in community feed
- ✅ Post creation completes in < 3 seconds
- ✅ Images are uploaded to CDN

**Test Cases**:
```typescript
describe('Post Creation', () => {
  test('should create post successfully', async () => {
    const user = await createUserWithCharacter();
    const workout = await createWorkoutRecord(user.id);

    const response = await POST('/posts', {
      title: 'Hit 100kg bench press!',
      content: 'Finally reached my goal!',
      category: 'achievement',
      workoutRecordId: workout.id
    }, { userId: user.id });

    expect(response.status).toBe(201);
    expect(response.data.id).toBeDefined();
    expect(response.data.workoutRecord).toBeDefined();
  });
});
```

---

#### US-6.2: View Feed
**As a** user
**I want to** see posts from other users
**So that** I can get inspired and engage with the community

**Acceptance Criteria**:
- ✅ User can view community feed sorted by latest/popular
- ✅ Each post shows: author, content, images, likes, comments count
- ✅ Feed is paginated (20 posts per page)
- ✅ Feed loads in < 2 seconds
- ✅ User can filter by category

**Test Cases**:
```typescript
describe('Community Feed', () => {
  test('should return paginated posts', async () => {
    await createPosts(25); // Create 25 posts

    const response = await GET('/posts?page=1&limit=20');

    expect(response.data.posts).toHaveLength(20);
    expect(response.data.pagination.total).toBe(25);
    expect(response.data.pagination.totalPages).toBe(2);
  });
});
```

---

### Epic 7: Rankings & Leaderboards

#### US-7.1: View Leaderboard
**As a** user
**I want to** see rankings for different categories
**So that** I can compete with others

**Acceptance Criteria**:
- ✅ Leaderboard types: total_level, body_part_level, workout_count
- ✅ Periods: daily, weekly, monthly, all_time
- ✅ Shows top 100 users
- ✅ Shows user's own rank (even if outside top 100)
- ✅ Leaderboard updates every 5 minutes
- ✅ Loads in < 2 seconds

**Test Cases**:
```typescript
describe('Leaderboards', () => {
  test('should return top 100 users by total level', async () => {
    await createUsersWithLevels(150); // Create 150 users

    const response = await GET('/leaderboards?type=total_level&period=all_time');

    expect(response.data.rankings).toHaveLength(100);
    expect(response.data.rankings[0].rank).toBe(1);
    expect(response.data.rankings[0].score).toBeGreaterThan(response.data.rankings[1].score);
  });

  test('should show user rank even if outside top 100', async () => {
    const user = await createUserWithCharacter({ totalLevel: 10 });
    await createUsersWithLevels(150, { minLevel: 50 }); // Create 150 higher-level users

    const response = await GET('/leaderboards?type=total_level', { userId: user.id });

    expect(response.data.myRank.rank).toBeGreaterThan(100);
    expect(response.data.myRank.score).toBe(10);
  });
});
```

---

## 5. Functional Requirements

### FR-1: Authentication & Authorization
- **FR-1.1**: System SHALL use JWT for authentication (access token: 15min, refresh token: 7d)
- **FR-1.2**: System SHALL hash passwords with bcrypt (salt rounds: 12)
- **FR-1.3**: System SHALL store refresh tokens in database with device information
- **FR-1.4**: System SHALL limit active refresh tokens to 5 per user
- **FR-1.5**: System SHALL validate all protected endpoints with auth middleware

**Tests**:
- ✅ JWT tokens expire at correct times
- ✅ Bcrypt hashing takes < 500ms
- ✅ Old refresh tokens are deleted when limit exceeded
- ✅ Unauthorized requests return 401

---

### FR-2: Workout Recording & Calculation
- **FR-2.1**: System SHALL calculate 1RM using Epley formula: `1RM = weight × (1 + reps / 30)`
- **FR-2.2**: System SHALL evaluate grade based on bodyweight ratio tables
- **FR-2.3**: System SHALL calculate EXP = `base_exp × grade_multiplier`
- **FR-2.4**: System SHALL distribute EXP: 80% to body part, 20% to total character
- **FR-2.5**: System SHALL calculate calories using exercise-specific coefficients

**Tests**:
- ✅ 1RM calculation accurate within 0.1kg
- ✅ Grade evaluation matches lookup table
- ✅ EXP distribution sums to 100%
- ✅ Calorie calculation matches expected value

---

### FR-3: Leveling System
- **FR-3.1**: System SHALL use exponential curve: `required_exp = 1000 × (1.15 ^ (level - 1))`
- **FR-3.2**: System SHALL support up to Level 100 per body part
- **FR-3.3**: System SHALL calculate total level as floor(average of 7 body parts)
- **FR-3.4**: System SHALL handle multiple level-ups in single workout
- **FR-3.5**: System SHALL carry over overflow EXP to next level

**Tests**:
- ✅ Level thresholds match formula at all levels
- ✅ Multiple level-ups process correctly
- ✅ Overflow EXP is preserved
- ✅ Total level updates when body part levels change

---

### FR-4: Skill Tree System
- **FR-4.1**: System SHALL support 3 requirement types: level, prerequisite skills, performance
- **FR-4.2**: System SHALL unlock skills when ALL requirements met
- **FR-4.3**: System SHALL check skill unlocks on: level-up, workout creation
- **FR-4.4**: System SHALL prevent duplicate skill unlocks
- **FR-4.5**: System SHALL store skill tree positions for visualization

**Tests**:
- ✅ Skills unlock only when all requirements met
- ✅ Skill unlock check runs within 1 second
- ✅ Duplicate unlock attempts are rejected
- ✅ Prerequisite chains work correctly

---

### FR-5: Map Progression
- **FR-5.1**: System SHALL support 6 map types (none, earth, fire, wind, water, mind)
- **FR-5.2**: System SHALL track progress for 3 clear condition types
- **FR-5.3**: System SHALL complete stage when all conditions met
- **FR-5.4**: System SHALL unlock next stages after completion
- **FR-5.5**: System SHALL distribute rewards upon stage completion

**Tests**:
- ✅ All clear condition types function correctly
- ✅ Stage completion is atomic
- ✅ Rewards are distributed correctly
- ✅ Next stages unlock as expected

---

### FR-6: Quest & Achievement System
- **FR-6.1**: System SHALL assign 3 random daily quests at 00:00 KST
- **FR-6.2**: System SHALL expire quests after 24 hours
- **FR-6.3**: System SHALL check achievements after every workout
- **FR-6.4**: System SHALL prevent duplicate reward claims
- **FR-6.5**: System SHALL track progress for incomplete achievements

**Tests**:
- ✅ Quest assignment runs on schedule
- ✅ Expired quests are not claimable
- ✅ Achievement unlock logic is accurate
- ✅ Progress tracking is persistent

---

### FR-7: Community Features
- **FR-7.1**: System SHALL support text posts, images (up to 5), workout attachments
- **FR-7.2**: System SHALL paginate feed (20 posts per page)
- **FR-7.3**: System SHALL support likes, comments, replies
- **FR-7.4**: System SHALL update view count on post access
- **FR-7.5**: System SHALL support post categories and filtering

**Tests**:
- ✅ Post creation handles all field types
- ✅ Pagination returns correct results
- ✅ Like/unlike toggles correctly
- ✅ View count increments uniquely

---

### FR-8: Leaderboards
- **FR-8.1**: System SHALL support 3 leaderboard types: level, body part, workout count
- **FR-8.2**: System SHALL support 4 time periods: daily, weekly, monthly, all-time
- **FR-8.3**: System SHALL cache rankings (refresh every 5 minutes)
- **FR-8.4**: System SHALL show user's rank regardless of position
- **FR-8.5**: System SHALL show rank change indicators

**Tests**:
- ✅ Rankings are sorted correctly
- ✅ Cache invalidates on schedule
- ✅ User rank is always shown
- ✅ Rank changes calculate correctly

---

## 6. Non-Functional Requirements

### NFR-1: Performance
- **NFR-1.1**: API response time < 500ms (p95)
- **NFR-1.2**: Workout recording completes in < 3 seconds
- **NFR-1.3**: Page load time < 2 seconds (first contentful paint)
- **NFR-1.4**: Database queries < 200ms (p95)
- **NFR-1.5**: Image uploads < 5 seconds (< 5MB files)

**Tests**:
- ✅ Load testing with 100 concurrent users
- ✅ Database query profiling
- ✅ Lighthouse performance score > 90

---

### NFR-2: Scalability
- **NFR-2.1**: System SHALL support 10,000 concurrent users
- **NFR-2.2**: Database SHALL handle 1M+ workout records
- **NFR-2.3**: System SHALL use connection pooling (min: 10, max: 50)
- **NFR-2.4**: System SHALL implement Redis caching for hot data
- **NFR-2.5**: Static assets SHALL use CDN

**Tests**:
- ✅ Stress testing with 10K virtual users
- ✅ Database load with 1M records
- ✅ Cache hit rate > 80%

---

### NFR-3: Reliability
- **NFR-3.1**: System uptime > 99.5% (monthly)
- **NFR-3.2**: Database transactions SHALL be ACID-compliant
- **NFR-3.3**: System SHALL retry failed external API calls (max 3 retries)
- **NFR-3.4**: System SHALL use database transactions for multi-table operations
- **NFR-3.5**: Error rate < 0.1% of requests

**Tests**:
- ✅ Transaction rollback on failure
- ✅ Retry logic verified
- ✅ Error monitoring with Sentry

---

### NFR-4: Security
- **NFR-4.1**: All API endpoints SHALL use HTTPS in production
- **NFR-4.2**: Passwords SHALL be hashed with bcrypt (salt rounds: 12)
- **NFR-4.3**: System SHALL rate limit: 100 req/min per user
- **NFR-4.4**: System SHALL sanitize all user inputs
- **NFR-4.5**: System SHALL validate file uploads (type, size)

**Tests**:
- ✅ Penetration testing for common vulnerabilities
- ✅ Rate limiting blocks excess requests
- ✅ XSS/SQL injection prevention verified

---

### NFR-5: Maintainability
- **NFR-5.1**: Code coverage > 80% for business logic
- **NFR-5.2**: All public functions SHALL have TypeScript type definitions
- **NFR-5.3**: Code SHALL follow TDD & Tidy First principles
- **NFR-5.4**: API documentation SHALL be auto-generated (Swagger)
- **NFR-5.5**: Git commits SHALL follow conventional commits

**Tests**:
- ✅ Coverage reports in CI/CD
- ✅ TypeScript strict mode enabled
- ✅ Linting passes with 0 errors

---

### NFR-6: Usability
- **NFR-6.1**: Mobile responsiveness (viewports: 375px - 1920px)
- **NFR-6.2**: Accessibility WCAG 2.1 AA compliance
- **NFR-6.3**: Support Korean and English languages
- **NFR-6.4**: Offline mode for workout recording (PWA)
- **NFR-6.5**: Loading states for all async operations

**Tests**:
- ✅ Responsive design testing on 5+ devices
- ✅ Lighthouse accessibility score > 90
- ✅ PWA audit passes

---

## 7. MVP Scope & Development Phases

### Phase 1: MVP (Weeks 1-6)

**Goal**: Launch core workout tracking with gamification

**Features**:
1. ✅ Authentication (register, login, JWT)
2. ✅ Character creation & profile
3. ✅ Workout recording (7 body parts, 50 exercises)
4. ✅ EXP & Leveling system (body parts + total)
5. ✅ Basic profile page (stats, recent workouts)

**Success Criteria**:
- 100 beta users complete onboarding
- 500 workout records created
- Average 3 workouts/week per user
- 80% test coverage

**Deliverables**:
- Docker-based deployment
- API documentation (Swagger)
- User manual
- Beta tester feedback report

---

### Phase 2: Gamification (Weeks 7-12)

**Goal**: Add game mechanics to increase engagement

**Features**:
1. ✅ Skill tree system (7 body parts × 30 skills each)
2. ✅ Map exploration (25 stages across 6 maps)
3. ✅ Daily quests (3 per day)
4. ✅ Achievements (50 total)
5. ✅ Detailed stats & analytics

**Success Criteria**:
- 1,000 active users
- 40% 30-day retention
- 70% users reach Level 5
- 50% users unlock at least 10 skills

**Deliverables**:
- Skill tree visualization
- Map UI
- Quest notification system
- Achievement badges

---

### Phase 3: Community (Weeks 13-18)

**Goal**: Build social features to create network effects

**Features**:
1. ✅ Community feed (posts, likes, comments)
2. ✅ Leaderboards (3 types, 4 periods)
3. ✅ Friend system
4. ✅ Workout sharing
5. ✅ User profiles (public view)

**Success Criteria**:
- 5,000 active users
- 1,000 posts/month
- 50% 30-day retention
- NPS > 40

**Deliverables**:
- Community guidelines
- Moderation tools
- Social sharing features
- Referral system

---

### Phase 4: Monetization (Weeks 19-24)

**Goal**: Launch premium features and revenue streams

**Features**:
1. ✅ Premium subscription ($9.99/month)
2. ✅ Food photo analysis (AI)
3. ✅ Advanced analytics
4. ✅ Ad-free experience
5. ✅ Custom workout plans

**Success Criteria**:
- 10,000 active users
- 5% premium conversion
- $5,000 MRR
- Profitable unit economics

**Deliverables**:
- Payment integration (Stripe)
- Premium feature gates
- Food analysis API
- Marketing materials

---

## 8. Testing Strategy

### 8.1 Test Pyramid

```
         /\
        /E2E\           <-- 10% (Critical user flows)
       /------\
      /  API   \        <-- 30% (REST endpoints)
     /----------\
    / Unit Tests \      <-- 60% (Business logic)
   /--------------\
```

### 8.2 Unit Tests

**Coverage Target**: 80% of business logic

**Tools**: Jest (backend), Vitest (frontend)

**Focus Areas**:
- Game engine (EXP calculation, leveling)
- RM analysis (1RM, grade evaluation)
- Skill unlock logic
- Map progression logic
- Authentication utilities

**Example**:
```typescript
describe('ExpEngine', () => {
  describe('calculateWorkoutExp', () => {
    test('should calculate base EXP correctly', () => {
      const exp = calculateWorkoutExp({
        weight: 60,
        reps: 10,
        sets: 3
      });
      expect(exp.baseExp).toBe(1800);
    });

    test('should apply grade multiplier', () => {
      const goldExp = calculateWorkoutExp({ grade: 'gold' });
      const silverExp = calculateWorkoutExp({ grade: 'silver' });
      expect(goldExp.totalExp).toBeGreaterThan(silverExp.totalExp);
    });
  });
});
```

---

### 8.3 Integration Tests

**Coverage Target**: All API endpoints

**Tools**: Supertest (backend), MSW (frontend)

**Focus Areas**:
- Auth flow (register → login → refresh)
- Workout recording → EXP gain → Level up
- Skill unlock triggers
- Map progression updates
- Quest completion flow

**Example**:
```typescript
describe('POST /workouts', () => {
  test('should record workout and return results', async () => {
    const user = await createTestUser();
    const token = await getAuthToken(user);

    const response = await request(app)
      .post('/api/v1/workouts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        exerciseId: 101,
        bodyPart: 'chest',
        weight: 60,
        reps: 10,
        sets: 3
      });

    expect(response.status).toBe(201);
    expect(response.body.data.workout).toBeDefined();
    expect(response.body.data.results.expGained).toBeGreaterThan(0);
  });
});
```

---

### 8.4 E2E Tests

**Coverage Target**: 5-10 critical user flows

**Tools**: Playwright

**Critical Flows**:
1. **Onboarding**: Register → Create Character → First Workout
2. **Level Up**: Record workouts until level-up → See notification
3. **Skill Unlock**: Meet requirements → Unlock skill → See in tree
4. **Quest Completion**: Accept quest → Complete → Claim reward
5. **Social**: Create post → Like → Comment

**Example**:
```typescript
test('Complete onboarding flow', async ({ page }) => {
  // Register
  await page.goto('/register');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'Test1234');
  await page.click('button[type="submit"]');

  // Create character
  await expect(page).toHaveURL('/character/create');
  await page.click('button:has-text("캐릭터 생성")');

  // First workout
  await expect(page).toHaveURL('/workout/record');
  await page.selectOption('[name="exercise"]', '101');
  await page.fill('[name="weight"]', '60');
  await page.fill('[name="reps"]', '10');
  await page.fill('[name="sets"]', '3');
  await page.click('button:has-text("기록하기")');

  // Verify success
  await expect(page.locator('.level-up-modal')).toBeVisible();
});
```

---

### 8.5 Performance Tests

**Tools**: k6, Artillery

**Scenarios**:
1. **Normal Load**: 100 concurrent users, 10 min
2. **Peak Load**: 500 concurrent users, 5 min
3. **Stress Test**: 1000 concurrent users until failure
4. **Spike Test**: 0 → 500 users in 1 minute

**Example**:
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const res = http.post('https://api.hellgater.com/v1/workouts', {
    exerciseId: 101,
    weight: 60,
    reps: 10,
    sets: 3,
  }, {
    headers: { Authorization: `Bearer ${__ENV.TOKEN}` },
  });

  check(res, { 'status is 201': (r) => r.status === 201 });
  sleep(1);
}
```

---

### 8.6 TDD Workflow

**Red → Green → Refactor**

1. **Red Phase**: Write failing test
```typescript
test('should calculate 1RM correctly', () => {
  const rm = calculate1RM(60, 10);
  expect(rm).toBeCloseTo(75, 1);
});
// ❌ Test fails: calculate1RM is not defined
```

2. **Green Phase**: Write minimal code to pass
```typescript
function calculate1RM(weight: number, reps: number): number {
  return weight + (weight * 0.025 * reps);
}
// ✅ Test passes
```

3. **Refactor Phase**: Improve code
```typescript
function calculate1RM(weight: number, reps: number): number {
  const EPLEY_MULTIPLIER = 0.025;
  const additionalWeight = weight * EPLEY_MULTIPLIER * reps;
  return weight + additionalWeight;
}
// ✅ Test still passes, code is cleaner
```

4. **Commit** (Structural change)
```bash
git commit -m "[Refactor] Extract Epley multiplier constant

- Moved magic number to named constant
- Improved code readability
- No behavior changes"
```

---

## 9. Out of Scope

### Explicitly NOT in MVP

- ❌ AI form checking (video analysis)
- ❌ Wearable device integration
- ❌ Nutrition tracking (beyond photo analysis)
- ❌ Personal trainer marketplace
- ❌ Live workout classes
- ❌ Equipment e-commerce
- ❌ Gym check-in (GPS)
- ❌ Custom exercise creation (user-generated)
- ❌ Multi-language support (beyond Korean/English)
- ❌ Voice commands
- ❌ AR/VR features

### Future Considerations (Post-MVP)

- Food photo analysis AI
- Workout plan generator AI
- Form checking AI (computer vision)
- Integration with Apple Health / Google Fit
- Smart watch app (WearOS, watchOS)
- Advanced analytics dashboard
- Export data (CSV, PDF reports)
- Workout plan marketplace

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **1RM** | One-Rep Max: Maximum weight one can lift for a single repetition |
| **EXP** | Experience Points: Gained from workouts to level up |
| **Body Part** | One of 7 muscle groups: shoulder, chest, back, arm, abdominal, hip, leg |
| **Grade** | Performance tier: Bronze, Silver, Gold, Platinum, Diamond, Master, Challenger |
| **Skill Tree** | Progression tree showing unlockable exercises |
| **Map** | Structured workout curriculum with stages |
| **Stage** | Individual mission in a map with clear conditions |
| **Quest** | Daily challenge with specific goals |
| **Achievement** | Milestone badge for long-term goals |

---

## Appendix B: User Flow Diagrams

### Onboarding Flow
```
[Landing Page] → [Register] → [Create Character] → [Tutorial] → [First Workout] → [Home]
```

### Workout Recording Flow
```
[Home] → [Record Workout]
          ↓
    [Select Exercise]
          ↓
    [Input Data: Weight, Reps, Sets]
          ↓
    [Submit]
          ↓
    [Processing: RM Analysis, EXP Calculation]
          ↓
    [Results Screen]
          ├── EXP Gained
          ├── Level Up? → [Level Up Modal]
          ├── Skills Unlocked? → [Skill Unlock Modal]
          ├── Achievements? → [Achievement Modal]
          └── Map Progress
          ↓
    [Home / Stats]
```

### Skill Unlock Flow
```
[Workout Complete]
    ↓
[Check Level]
    ↓
[Level Up?] ----YES----> [Check Skill Requirements]
    |                           ↓
    NO                    [All Met?]
    ↓                           |
[End]                          YES
                                ↓
                          [Unlock Skill]
                                ↓
                          [Show Notification]
                                ↓
                          [Update Skill Tree]
```

---

## Appendix C: API Contract Examples

### POST /auth/register
```typescript
// Request
interface RegisterRequest {
  email: string;       // Valid email format
  password: string;    // Min 8 chars, 1 upper, 1 lower, 1 number
  username: string;    // 3-20 chars, alphanumeric + underscore
  gender?: 'male' | 'female' | 'other';
  birthdate?: string;  // YYYY-MM-DD
  height?: number;     // cm
  weight?: number;     // kg
}

// Response (201)
interface RegisterResponse {
  success: true;
  data: {
    user: User;
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number; // seconds
    };
  };
}

// Error (409)
interface ErrorResponse {
  success: false;
  error: {
    code: 'USER_ALREADY_EXISTS';
    message: string;
  };
}
```

### POST /workouts
```typescript
// Request
interface CreateWorkoutRequest {
  exerciseId: number;
  bodyPart: BodyPartCode;
  sets: number;        // 1-10
  reps: number;        // 1-50
  weight: number;      // kg, >= 0
  workoutDate: string; // YYYY-MM-DD
  notes?: string;
  videoUrl?: string;
}

// Response (201)
interface CreateWorkoutResponse {
  success: true;
  data: {
    workout: WorkoutRecord;
    results: {
      levelUp: LevelUpResult;
      expGained: {
        bodyPart: number;
        total: number;
        attribute?: number;
      };
      unlockedSkills: Skill[];
      newAchievements: Achievement[];
      mapProgress: {
        stageCleared: boolean;
        stageName: string;
        progress: Record<string, number>;
      };
    };
  };
}
```

---

## Approval Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | | | |
| Tech Lead | | | |
| QA Lead | | | |
| Design Lead | | | |

---

**END OF PRD**
