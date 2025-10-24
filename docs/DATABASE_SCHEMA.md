# 헬게이터 - 데이터베이스 스키마 설계

## ERD 개요

```
users (사용자)
  │
  ├─── characters (캐릭터 정보)
  │
  ├─── user_body_parts (부위별 레벨)
  │      └─── workout_records (운동 기록)
  │             └─── exercises (운동 종목)
  │
  ├─── user_skills (해금 스킬)
  │      └─── skills (스킬 마스터)
  │
  ├─── user_map_progress (맵 진행)
  │      └─── map_stages (맵 스테이지)
  │
  ├─── user_achievements (업적)
  │      └─── achievements (업적 마스터)
  │
  └─── user_quests (퀘스트 진행)
         └─── daily_quests (일일 퀘스트)
```

---

## 1. 사용자 & 캐릭터

### 1.1 users (사용자)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,

  -- 프로필
  profile_image_url TEXT,
  bio TEXT,

  -- 기본 정보
  gender VARCHAR(10), -- 'male', 'female', 'other'
  birthdate DATE,
  height DECIMAL(5,2), -- cm
  weight DECIMAL(5,2), -- kg

  -- 가입/활동 정보
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,

  -- 구독 정보
  subscription_tier VARCHAR(20) DEFAULT 'free', -- 'free', 'premium'
  subscription_expires_at TIMESTAMP,

  -- 소프트 삭제
  deleted_at TIMESTAMP,

  CONSTRAINT valid_gender CHECK (gender IN ('male', 'female', 'other')),
  CONSTRAINT valid_subscription CHECK (subscription_tier IN ('free', 'premium'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created_at ON users(created_at);
```

### 1.2 characters (캐릭터)
```sql
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 캐릭터 외형
  character_model VARCHAR(50) DEFAULT 'default', -- 캐릭터 모델 종류
  skin_color VARCHAR(20),

  -- 전체 레벨
  total_level INTEGER DEFAULT 1,
  total_exp INTEGER DEFAULT 0,

  -- 능력치 (캐릭터 시스템의 9가지 능력치)
  muscle_endurance INTEGER DEFAULT 0, -- 근지구력
  strength INTEGER DEFAULT 0,         -- 근력
  explosive_power INTEGER DEFAULT 0,  -- 순발력
  speed INTEGER DEFAULT 0,            -- 속도
  mental_power INTEGER DEFAULT 0,     -- 정체력
  flexibility INTEGER DEFAULT 0,      -- 유연성
  knowledge INTEGER DEFAULT 0,        -- 지식
  balance INTEGER DEFAULT 0,          -- 균형감각
  agility INTEGER DEFAULT 0,          -- 반감성

  -- 5속성 진행도
  earth_progress INTEGER DEFAULT 0,   -- 땅(근육)
  fire_progress INTEGER DEFAULT 0,    -- 불(체력)
  wind_progress INTEGER DEFAULT 0,    -- 바람(심폐)
  water_progress INTEGER DEFAULT 0,   -- 물(지방)
  mind_progress INTEGER DEFAULT 0,    -- 마음(근성)

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id) -- 1유저 1캐릭터
);

CREATE INDEX idx_characters_user_id ON characters(user_id);
CREATE INDEX idx_characters_total_level ON characters(total_level);
```

---

## 2. 부위별 레벨 & 운동 기록

### 2.1 body_parts (부위 마스터 - 읽기 전용)
```sql
CREATE TABLE body_parts (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL, -- 'shoulder', 'chest', 'back', etc.
  name_ko VARCHAR(50) NOT NULL,     -- '어깨', '가슴', '등', etc.
  name_en VARCHAR(50) NOT NULL,
  display_order INTEGER NOT NULL,

  CONSTRAINT unique_body_part_code UNIQUE(code)
);

-- 초기 데이터
INSERT INTO body_parts (code, name_ko, name_en, display_order) VALUES
  ('shoulder', '어깨', 'Shoulder', 1),
  ('chest', '가슴', 'Chest', 2),
  ('back', '등', 'Back', 3),
  ('arm', '팔', 'Arm', 4),
  ('abdominal', '복근', 'Abdominal', 5),
  ('hip', '엉덩이', 'Hip', 6),
  ('leg', '다리', 'Leg', 7);
```

### 2.2 user_body_parts (사용자별 부위 레벨)
```sql
CREATE TABLE user_body_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body_part_id INTEGER NOT NULL REFERENCES body_parts(id),

  -- 레벨 & 경험치
  level INTEGER DEFAULT 1,
  current_exp INTEGER DEFAULT 0,

  -- 1RM 기록 (주요 운동별)
  max_1rm_weight DECIMAL(6,2) DEFAULT 0, -- 해당 부위 최고 1RM
  last_workout_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, body_part_id)
);

CREATE INDEX idx_user_body_parts_user_id ON user_body_parts(user_id);
CREATE INDEX idx_user_body_parts_level ON user_body_parts(user_id, level);
```

### 2.3 exercises (운동 종목 마스터)
```sql
CREATE TABLE exercises (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,  -- 'bench_press', 'squat', etc.
  name_ko VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,

  -- 분류
  body_part_id INTEGER NOT NULL REFERENCES body_parts(id),
  category VARCHAR(50),              -- 'compound', 'isolation', 'cardio'
  difficulty VARCHAR(20),            -- 'beginner', 'intermediate', 'advanced'

  -- 설명
  description TEXT,
  how_to TEXT,                       -- 수행 방법
  video_url TEXT,                    -- 가이드 영상
  thumbnail_url TEXT,

  -- 칼로리 계산 (kg당 kcal/rep)
  calorie_per_rep_kg DECIMAL(6,4) DEFAULT 0.05,

  -- 메타 정보
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_exercises_body_part ON exercises(body_part_id);
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty);
```

### 2.4 workout_records (운동 기록)
```sql
CREATE TABLE workout_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id INTEGER NOT NULL REFERENCES exercises(id),
  body_part_id INTEGER NOT NULL REFERENCES body_parts(id),

  -- 운동 수행 정보
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight DECIMAL(6,2) NOT NULL,      -- kg

  -- RM 분석 결과
  calculated_1rm DECIMAL(6,2),       -- 계산된 1RM
  rm_percentage DECIMAL(5,2),        -- RM 백분율 (예: 75%)
  grade VARCHAR(20),                 -- 'bronze', 'silver', 'gold', etc.

  -- 경험치 & 칼로리
  exp_gained INTEGER,                -- 획득 경험치
  calories_burned DECIMAL(6,2),      -- 소모 칼로리

  -- 인증
  video_url TEXT,                    -- 영상 인증
  verified BOOLEAN DEFAULT false,    -- 영상 인증 완료 여부

  -- 메모
  notes TEXT,

  -- 시간
  workout_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT positive_sets CHECK (sets > 0),
  CONSTRAINT positive_reps CHECK (reps > 0),
  CONSTRAINT positive_weight CHECK (weight >= 0)
);

CREATE INDEX idx_workout_records_user_date ON workout_records(user_id, workout_date DESC);
CREATE INDEX idx_workout_records_body_part ON workout_records(user_id, body_part_id, workout_date DESC);
CREATE INDEX idx_workout_records_exercise ON workout_records(exercise_id);
```

---

## 3. 스킬트리 시스템

### 3.1 skills (스킬 마스터)
```sql
CREATE TABLE skills (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name_ko VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,

  -- 스킬 분류
  body_part_id INTEGER NOT NULL REFERENCES body_parts(id),
  tier VARCHAR(20) NOT NULL,         -- 'beginner', 'silver', 'gold', 'platinum', 'diamond', 'master', 'challenger'

  -- 연결된 운동
  exercise_id INTEGER REFERENCES exercises(id),

  -- 해금 조건
  required_level INTEGER,            -- 필요 레벨
  required_reps INTEGER,             -- 필요 횟수
  required_weight DECIMAL(6,2),      -- 필요 무게
  prerequisite_skill_ids INTEGER[],  -- 선행 스킬 ID 배열

  -- 스킬트리 시각화 정보
  tree_position_x INTEGER,
  tree_position_y INTEGER,
  icon_url TEXT,

  -- 설명
  description TEXT,
  unlock_message TEXT,               -- 해금 시 표시될 메시지

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_skills_body_part ON skills(body_part_id);
CREATE INDEX idx_skills_tier ON skills(tier);
```

### 3.2 user_skills (사용자별 해금된 스킬)
```sql
CREATE TABLE user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skills(id),

  unlocked_at TIMESTAMP DEFAULT NOW(),

  -- 스킬 사용 통계
  times_used INTEGER DEFAULT 0,
  last_used_at TIMESTAMP,

  UNIQUE(user_id, skill_id)
);

CREATE INDEX idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX idx_user_skills_unlocked_at ON user_skills(user_id, unlocked_at DESC);
```

---

## 4. 맵 탐험 시스템

### 4.1 map_stages (맵 스테이지 마스터)
```sql
CREATE TABLE map_stages (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,  -- 'stage_1_1', 'stage_1_2', etc.

  -- 맵 분류
  map_type VARCHAR(20) NOT NULL,     -- 'none', 'earth', 'fire', 'wind', 'water', 'mind'
  chapter INTEGER NOT NULL,
  stage INTEGER NOT NULL,

  -- 표시 정보
  name_ko VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  description TEXT,
  background_image_url TEXT,

  -- 해금 조건
  required_total_level INTEGER,
  prerequisite_stage_id INTEGER REFERENCES map_stages(id),

  -- 클리어 조건
  clear_conditions JSONB,            -- { "workouts": 5, "exp": 1000, "specific_exercise": "squat" }

  -- 보상
  rewards JSONB,                     -- { "exp": 500, "items": [...] }

  -- 맵 좌표
  map_position_x INTEGER,
  map_position_y INTEGER,

  display_order INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_map_stages_type ON map_stages(map_type, chapter, stage);
```

### 4.2 user_map_progress (사용자별 맵 진행)
```sql
CREATE TABLE user_map_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stage_id INTEGER NOT NULL REFERENCES map_stages(id),

  -- 진행 상태
  status VARCHAR(20) DEFAULT 'locked', -- 'locked', 'unlocked', 'in_progress', 'completed'

  -- 진행도
  progress JSONB,                    -- { "workouts": 3, "exp": 750 }

  -- 완료 정보
  completed_at TIMESTAMP,
  completion_time_seconds INTEGER,   -- 클리어 소요 시간

  unlocked_at TIMESTAMP,
  started_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, stage_id)
);

CREATE INDEX idx_user_map_progress_user_status ON user_map_progress(user_id, status);
CREATE INDEX idx_user_map_progress_completed ON user_map_progress(user_id, completed_at DESC);
```

---

## 5. 업적 & 퀘스트

### 5.1 achievements (업적 마스터)
```sql
CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name_ko VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  description TEXT,

  -- 업적 분류
  category VARCHAR(50),              -- 'workout', 'level', 'streak', 'social', etc.
  tier VARCHAR(20),                  -- 'bronze', 'silver', 'gold', 'platinum'

  -- 달성 조건
  condition_type VARCHAR(50),        -- 'total_workouts', 'streak_days', 'level_reached', etc.
  condition_value INTEGER,

  -- 보상
  reward_exp INTEGER DEFAULT 0,
  reward_items JSONB,

  -- 표시
  icon_url TEXT,
  badge_url TEXT,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_achievements_category ON achievements(category);
```

### 5.2 user_achievements (사용자별 업적)
```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INTEGER NOT NULL REFERENCES achievements(id),

  -- 진행 상태
  progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,

  -- 표시 설정
  is_displayed BOOLEAN DEFAULT false, -- 프로필에 표시 여부

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user_completed ON user_achievements(user_id, is_completed, completed_at DESC);
```

### 5.3 daily_quests (일일 퀘스트 마스터)
```sql
CREATE TABLE daily_quests (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name_ko VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  description TEXT,

  -- 퀘스트 조건
  quest_type VARCHAR(50),            -- 'workout_count', 'specific_bodypart', 'calories_burned', etc.
  target_value INTEGER,
  target_body_part_id INTEGER REFERENCES body_parts(id),

  -- 보상
  reward_exp INTEGER DEFAULT 0,
  reward_items JSONB,

  -- 반복 설정
  recurrence VARCHAR(20),            -- 'daily', 'weekly', 'once'

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5.4 user_quests (사용자별 퀘스트 진행)
```sql
CREATE TABLE user_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quest_id INTEGER NOT NULL REFERENCES daily_quests(id),

  -- 진행 상태
  progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,

  -- 보상 수령
  reward_claimed BOOLEAN DEFAULT false,
  reward_claimed_at TIMESTAMP,

  -- 퀘스트 할당 날짜
  assigned_date DATE NOT NULL,
  expires_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, quest_id, assigned_date)
);

CREATE INDEX idx_user_quests_user_date ON user_quests(user_id, assigned_date DESC);
CREATE INDEX idx_user_quests_active ON user_quests(user_id, is_completed, assigned_date);
```

---

## 6. 커뮤니티 & 소셜

### 6.1 posts (커뮤니티 게시글)
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 게시글 내용
  title VARCHAR(200),
  content TEXT NOT NULL,
  images TEXT[],                     -- 이미지 URL 배열

  -- 연관 운동 기록
  workout_record_id UUID REFERENCES workout_records(id),

  -- 카테고리
  category VARCHAR(50),              -- 'workout', 'achievement', 'question', 'tips', etc.

  -- 통계
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,

  -- 상태
  is_published BOOLEAN DEFAULT true,
  deleted_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_posts_user_id ON posts(user_id, created_at DESC);
CREATE INDEX idx_posts_category ON posts(category, created_at DESC);
CREATE INDEX idx_posts_popular ON posts(likes_count DESC, created_at DESC);
```

### 6.2 post_likes (게시글 좋아요)
```sql
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_post_likes_user ON post_likes(user_id, created_at DESC);
```

### 6.3 comments (댓글)
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  content TEXT NOT NULL,

  -- 대댓글
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,

  likes_count INTEGER DEFAULT 0,

  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_comments_post ON comments(post_id, created_at ASC);
CREATE INDEX idx_comments_user ON comments(user_id, created_at DESC);
```

### 6.4 friendships (친구 관계)
```sql
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, friend_id),
  CONSTRAINT no_self_friendship CHECK (user_id != friend_id)
);

CREATE INDEX idx_friendships_user_status ON friendships(user_id, status);
```

---

## 7. 랭킹 & 리더보드

### 7.1 leaderboards (랭킹 캐시 테이블)
```sql
CREATE TABLE leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 랭킹 타입
  leaderboard_type VARCHAR(50) NOT NULL, -- 'total_level', 'body_part_level', 'workout_count', etc.
  body_part_id INTEGER REFERENCES body_parts(id),

  -- 점수
  score INTEGER NOT NULL,
  rank INTEGER,

  -- 시간 범위
  period VARCHAR(20),                -- 'daily', 'weekly', 'monthly', 'all_time'
  period_start DATE,
  period_end DATE,

  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, leaderboard_type, body_part_id, period, period_start)
);

CREATE INDEX idx_leaderboards_type_rank ON leaderboards(leaderboard_type, period, rank ASC);
CREATE INDEX idx_leaderboards_bodypart ON leaderboards(leaderboard_type, body_part_id, period, rank ASC);
```

---

## 8. 시스템 테이블

### 8.1 refresh_tokens (리프레시 토큰)
```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  token_hash VARCHAR(255) NOT NULL,

  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  -- 디바이스 정보
  device_type VARCHAR(50),
  device_id VARCHAR(255),
  ip_address INET
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
```

### 8.2 activity_logs (활동 로그)
```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- 활동 정보
  action VARCHAR(100) NOT NULL,      -- 'login', 'workout_recorded', 'level_up', etc.
  resource_type VARCHAR(50),         -- 'workout', 'skill', 'achievement', etc.
  resource_id VARCHAR(255),

  -- 메타 정보
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user_action ON activity_logs(user_id, action, created_at DESC);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
```

---

## 9. Prisma Schema 예시

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                    String     @id @default(uuid()) @db.Uuid
  email                 String     @unique @db.VarChar(255)
  passwordHash          String     @map("password_hash") @db.VarChar(255)
  username              String     @unique @db.VarChar(50)

  profileImageUrl       String?    @map("profile_image_url")
  bio                   String?

  gender                String?    @db.VarChar(10)
  birthdate             DateTime?  @db.Date
  height                Decimal?   @db.Decimal(5, 2)
  weight                Decimal?   @db.Decimal(5, 2)

  createdAt             DateTime   @default(now()) @map("created_at")
  updatedAt             DateTime   @updatedAt @map("updated_at")
  lastLoginAt           DateTime?  @map("last_login_at")

  subscriptionTier      String     @default("free") @map("subscription_tier") @db.VarChar(20)
  subscriptionExpiresAt DateTime?  @map("subscription_expires_at")

  deletedAt             DateTime?  @map("deleted_at")

  // Relations
  character             Character?
  bodyParts             UserBodyPart[]
  workoutRecords        WorkoutRecord[]
  skills                UserSkill[]
  mapProgress           UserMapProgress[]
  achievements          UserAchievement[]
  quests                UserQuest[]
  posts                 Post[]

  @@map("users")
}

model Character {
  id                String   @id @default(uuid()) @db.Uuid
  userId            String   @unique @map("user_id") @db.Uuid

  characterModel    String   @default("default") @map("character_model") @db.VarChar(50)
  skinColor         String?  @map("skin_color") @db.VarChar(20)

  totalLevel        Int      @default(1) @map("total_level")
  totalExp          Int      @default(0) @map("total_exp")

  muscleEndurance   Int      @default(0) @map("muscle_endurance")
  strength          Int      @default(0)
  explosivePower    Int      @default(0) @map("explosive_power")
  speed             Int      @default(0)
  mentalPower       Int      @default(0) @map("mental_power")
  flexibility       Int      @default(0)
  knowledge         Int      @default(0)
  balance           Int      @default(0)
  agility           Int      @default(0)

  earthProgress     Int      @default(0) @map("earth_progress")
  fireProgress      Int      @default(0) @map("fire_progress")
  windProgress      Int      @default(0) @map("wind_progress")
  waterProgress     Int      @default(0) @map("water_progress")
  mindProgress      Int      @default(0) @map("mind_progress")

  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  // Relations
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("characters")
}

// ... (다른 모델들도 유사하게 정의)
```

---

## 10. 인덱싱 전략

### 자주 조회되는 쿼리
1. **사용자별 최근 운동 기록**: `idx_workout_records_user_date`
2. **부위별 운동 기록**: `idx_workout_records_body_part`
3. **랭킹 조회**: `idx_leaderboards_type_rank`
4. **스킬 해금 체크**: `idx_user_skills_user_id`
5. **맵 진행 상태**: `idx_user_map_progress_user_status`

### 복합 인덱스 우선순위
- `(user_id, created_at DESC)`: 사용자별 시간순 조회
- `(user_id, body_part_id, workout_date DESC)`: 부위별 운동 기록
- `(leaderboard_type, period, rank ASC)`: 랭킹 조회

---

## 11. 데이터 마이그레이션 순서

1. **기본 테이블**: users, body_parts, exercises
2. **캐릭터**: characters, user_body_parts
3. **운동**: workout_records
4. **게임 요소**: skills, user_skills, map_stages, user_map_progress
5. **퀘스트**: achievements, user_achievements, daily_quests, user_quests
6. **커뮤니티**: posts, comments, post_likes, friendships
7. **시스템**: leaderboards, refresh_tokens, activity_logs

---

**다음 단계**: GAME_LOGIC.md에서 경험치 계산 알고리즘 설계
