# 콘텐츠 시스템 데이터베이스 스키마 확장

## 📚 콘텐츠 관련 테이블

### 1. curriculum_weeks (커리큘럼 주차 마스터)
```sql
CREATE TABLE curriculum_weeks (
  id SERIAL PRIMARY KEY,
  week_number INTEGER NOT NULL UNIQUE,  -- 0, 1, 2, ..., 25
  
  -- 기본 정보
  title_ko VARCHAR(200) NOT NULL,
  title_en VARCHAR(200) NOT NULL,
  theme VARCHAR(200),                    -- "측정의 중요성", "식단 일기" 등
  
  -- 분류
  phase INTEGER NOT NULL,                -- 1 (기초), 2 (전문화), 3 (통합)
  chapter INTEGER,                       -- 챕터 번호
  
  -- 속성 (13주차 이후)
  element_type VARCHAR(20),              -- NULL, 'earth', 'fire', 'wind', 'water', 'mind'
  
  -- 해금 조건
  required_total_level INTEGER DEFAULT 0,
  prerequisite_week_id INTEGER REFERENCES curriculum_weeks(id),
  
  -- 예상 소요 시간
  estimated_minutes INTEGER,             -- 30-50분
  
  -- 메타 정보
  display_order INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_curriculum_weeks_number ON curriculum_weeks(week_number);
CREATE INDEX idx_curriculum_weeks_element ON curriculum_weeks(element_type);
```

### 2. content_items (콘텐츠 아이템)
```sql
CREATE TABLE content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id INTEGER NOT NULL REFERENCES curriculum_weeks(id),
  
  -- 콘텐츠 타입
  content_type VARCHAR(50) NOT NULL,     -- 'cinematic_video', 'lecture_video', 'exercise_demo', 
                                         -- 'infographic', 'quiz', 'calculator', 'assignment'
  
  -- 기본 정보
  title_ko VARCHAR(200) NOT NULL,
  title_en VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- 콘텐츠 URL/데이터
  content_url TEXT,                      -- 영상/이미지 URL
  content_data JSONB,                    -- 퀴즈 문제, 계산기 설정 등
  
  -- 순서 및 필수 여부
  display_order INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT true,      -- 필수 콘텐츠 여부
  
  -- 예상 소요 시간
  estimated_minutes INTEGER,
  
  -- 보상
  reward_exp INTEGER DEFAULT 0,
  
  -- 메타 정보
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_content_items_week ON content_items(week_id, display_order);
CREATE INDEX idx_content_items_type ON content_items(content_type);
```

### 3. user_content_progress (사용자별 콘텐츠 진행)
```sql
CREATE TABLE user_content_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_item_id UUID NOT NULL REFERENCES content_items(id),
  
  -- 진행 상태
  status VARCHAR(20) DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
  
  -- 진행도 (영상 시청률 등)
  progress_percentage INTEGER DEFAULT 0,   -- 0-100
  
  -- 완료 정보
  completed_at TIMESTAMP,
  time_spent_seconds INTEGER DEFAULT 0,
  
  -- 퀴즈/과제 결과
  quiz_score INTEGER,                      -- 퀴즈 점수
  quiz_answers JSONB,                      -- 사용자 답변
  assignment_data JSONB,                   -- 과제 제출 데이터
  
  -- 보상 수령
  reward_claimed BOOLEAN DEFAULT false,
  reward_claimed_at TIMESTAMP,
  
  started_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, content_item_id)
);

CREATE INDEX idx_user_content_progress_user ON user_content_progress(user_id, status);
CREATE INDEX idx_user_content_progress_completed ON user_content_progress(user_id, completed_at DESC);
```

### 4. user_week_progress (사용자별 주차 진행)
```sql
CREATE TABLE user_week_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_id INTEGER NOT NULL REFERENCES curriculum_weeks(id),
  
  -- 진행 상태
  status VARCHAR(20) DEFAULT 'locked',     -- 'locked', 'unlocked', 'in_progress', 'completed'
  
  -- 완료율
  completion_percentage INTEGER DEFAULT 0, -- 0-100
  completed_contents_count INTEGER DEFAULT 0,
  total_contents_count INTEGER,
  
  -- 시간 정보
  unlocked_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  total_time_spent_seconds INTEGER DEFAULT 0,
  
  -- 보상
  total_exp_earned INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, week_id)
);

CREATE INDEX idx_user_week_progress_user_status ON user_week_progress(user_id, status);
CREATE INDEX idx_user_week_progress_completed ON user_week_progress(user_id, completed_at DESC);
```

### 5. body_measurements (신체 측정 기록)
```sql
CREATE TABLE body_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 기본 측정
  weight DECIMAL(5,2) NOT NULL,            -- kg
  height DECIMAL(5,2),                     -- cm (변하지 않지만 기록)
  
  -- 인바디 데이터
  body_fat_percentage DECIMAL(4,2),        -- %
  skeletal_muscle_mass DECIMAL(5,2),       -- kg
  bmr INTEGER,                             -- kcal (기초대사량)
  
  -- 둘레 측정
  waist_circumference DECIMAL(5,2),        -- cm
  hip_circumference DECIMAL(5,2),          -- cm
  chest_circumference DECIMAL(5,2),        -- cm
  arm_circumference DECIMAL(5,2),          -- cm (왼팔 또는 오른팔)
  thigh_circumference DECIMAL(5,2),        -- cm
  
  -- 계산 값
  bmi DECIMAL(4,2),                        -- BMI
  body_fat_mass DECIMAL(5,2),              -- kg (체지방량)
  lean_body_mass DECIMAL(5,2),             -- kg (제지방량)
  
  -- 측정 정보
  measurement_date DATE NOT NULL,
  measurement_time TIME,
  measurement_location VARCHAR(100),       -- "헬스장", "집", "보건소" 등
  measurement_device VARCHAR(100),         -- "InBody 770", "샤오미 체성분계" 등
  
  -- 메모
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_body_measurements_user_date ON body_measurements(user_id, measurement_date DESC);
```

### 6. progress_photos (진행 사진)
```sql
CREATE TABLE progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 사진 정보
  photo_type VARCHAR(20) NOT NULL,         -- 'front', 'side', 'back'
  photo_url TEXT NOT NULL,                 -- S3 URL (암호화)
  thumbnail_url TEXT,
  
  -- 촬영 정보
  photo_date DATE NOT NULL,
  photo_time TIME,
  
  -- 연관 측정 (선택)
  measurement_id UUID REFERENCES body_measurements(id),
  
  -- 주차 (0주차, 4주차, 8주차 등)
  week_number INTEGER,
  
  -- 공개 설정
  is_public BOOLEAN DEFAULT false,         -- 커뮤니티 공개 여부
  
  -- 메타 정보
  file_size_bytes INTEGER,
  image_width INTEGER,
  image_height INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_progress_photos_user_date ON progress_photos(user_id, photo_date DESC);
CREATE INDEX idx_progress_photos_type ON progress_photos(user_id, photo_type, photo_date DESC);
```

### 7. food_logs (식단 기록)
```sql
CREATE TABLE food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 식사 정보
  meal_type VARCHAR(20) NOT NULL,          -- 'breakfast', 'lunch', 'dinner', 'snack'
  meal_date DATE NOT NULL,
  meal_time TIME,
  
  -- 음식 정보
  food_name VARCHAR(200),
  food_photo_url TEXT,                     -- 음식 사진
  
  -- 영양 정보 (AI 분석 또는 수동 입력)
  calories INTEGER,                        -- kcal
  protein DECIMAL(5,2),                    -- g
  carbohydrates DECIMAL(5,2),              -- g
  fat DECIMAL(5,2),                        -- g
  
  -- 분석 상태
  is_analyzed BOOLEAN DEFAULT false,       -- AI 분석 완료 여부
  analysis_confidence DECIMAL(3,2),        -- 0.00-1.00 (AI 신뢰도)
  
  -- 메모
  notes TEXT,
  mood VARCHAR(50),                        -- 식사 시 기분 (감정 식사 추적)
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_food_logs_user_date ON food_logs(user_id, meal_date DESC);
CREATE INDEX idx_food_logs_meal_type ON food_logs(user_id, meal_type, meal_date DESC);
```

### 8. user_goals (사용자 목표)
```sql
CREATE TABLE user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 목표 타입
  goal_type VARCHAR(50) NOT NULL,          -- 'weight_loss', 'muscle_gain', 'body_recomp', 'health'
  
  -- 목표 수치
  target_weight DECIMAL(5,2),              -- kg
  target_body_fat_percentage DECIMAL(4,2), -- %
  target_muscle_mass DECIMAL(5,2),         -- kg
  
  -- 기간
  start_date DATE NOT NULL,
  target_date DATE NOT NULL,
  
  -- 현재 vs 목표
  starting_weight DECIMAL(5,2),
  starting_body_fat DECIMAL(4,2),
  current_weight DECIMAL(5,2),
  current_body_fat DECIMAL(4,2),
  
  -- 진행률
  progress_percentage INTEGER DEFAULT 0,   -- 0-100
  
  -- 상태
  status VARCHAR(20) DEFAULT 'active',     -- 'active', 'completed', 'abandoned'
  completed_at TIMESTAMP,
  
  -- 메모
  motivation TEXT,                         -- 동기 부여 문구
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_goals_user_status ON user_goals(user_id, status);
CREATE INDEX idx_user_goals_target_date ON user_goals(user_id, target_date);
```

---

## 🔄 기존 테이블 확장

### characters 테이블에 바알시불 정보 추가
```sql
ALTER TABLE characters
ADD COLUMN baal_sibul_level INTEGER DEFAULT 1,
ADD COLUMN baal_sibul_exp INTEGER DEFAULT 0,
ADD COLUMN baal_sibul_appearance VARCHAR(50) DEFAULT 'baby', -- 'baby', 'teen', 'adult', 'master'
ADD COLUMN baal_sibul_element VARCHAR(20),                   -- 선택한 주 속성
ADD COLUMN baal_sibul_mood VARCHAR(20) DEFAULT 'happy';      -- 'happy', 'sad', 'excited', 'tired'
```

---

## 📊 초기 데이터 삽입

### 0주차 커리큘럼 데이터
```sql
INSERT INTO curriculum_weeks (week_number, title_ko, title_en, theme, phase, chapter, estimated_minutes, display_order)
VALUES (0, '운명의 시작 - 바알시불과의 만남', 'Destiny Begins - Meeting Baal-Sibul', '왜 운동을 해야 하는가?', 1, 1, 40, 0);

-- 0주차 콘텐츠 아이템들
INSERT INTO content_items (week_id, content_type, title_ko, title_en, content_data, display_order, estimated_minutes, reward_exp)
VALUES 
  (1, 'cinematic_video', '시네마틱 인트로', 'Cinematic Intro', 
   '{"duration_seconds": 180, "has_subtitles": true}', 1, 3, 200),
  
  (1, 'quiz', '목표 설정 퀴즈', 'Goal Setting Quiz',
   '{"questions": [
     {"id": 1, "text": "당신의 주요 목표는?", "type": "single_choice", "options": ["체중 감량", "근육 증가", "체력 향상", "체형 개선"]},
     {"id": 2, "text": "현재 운동 경험은?", "type": "single_choice", "options": ["전혀 없음", "가끔 했음", "어느 정도 있음", "경험 많음"]}
   ]}', 2, 5, 300),
  
  (1, 'assignment', '인바디 측정', 'Body Composition Measurement',
   '{"type": "measurement", "required_fields": ["weight", "waist_circumference"]}', 3, 15, 500),
  
  (1, 'assignment', 'Before 사진 촬영', 'Before Photos',
   '{"type": "photo_upload", "required_angles": ["front", "side", "back"]}', 4, 10, 800);
```

---

## 🔍 주요 쿼리 예시

### 1. 사용자의 주차별 진행 현황 조회
```sql
SELECT 
  cw.week_number,
  cw.title_ko,
  uwp.status,
  uwp.completion_percentage,
  uwp.completed_at
FROM curriculum_weeks cw
LEFT JOIN user_week_progress uwp ON cw.id = uwp.week_id AND uwp.user_id = $1
ORDER BY cw.week_number;
```

### 2. 특정 주차의 콘텐츠 목록 및 진행 상태
```sql
SELECT 
  ci.id,
  ci.content_type,
  ci.title_ko,
  ci.estimated_minutes,
  ci.reward_exp,
  ucp.status,
  ucp.progress_percentage,
  ucp.completed_at
FROM content_items ci
LEFT JOIN user_content_progress ucp ON ci.id = ucp.content_item_id AND ucp.user_id = $1
WHERE ci.week_id = $2
ORDER BY ci.display_order;
```

### 3. 사용자의 체중 변화 추이
```sql
SELECT 
  measurement_date,
  weight,
  body_fat_percentage,
  skeletal_muscle_mass
FROM body_measurements
WHERE user_id = $1
ORDER BY measurement_date DESC
LIMIT 10;
```

### 4. 일일 칼로리 섭취량 계산
```sql
SELECT 
  meal_date,
  SUM(calories) as total_calories,
  SUM(protein) as total_protein,
  SUM(carbohydrates) as total_carbs,
  SUM(fat) as total_fat
FROM food_logs
WHERE user_id = $1 AND meal_date = $2
GROUP BY meal_date;
```

---

**문서 버전**: 1.0  
**작성일**: 2025-12-09  
**연관 문서**: DATABASE_SCHEMA.md, CONTENT_STRATEGY.md
