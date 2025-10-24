# 헬게이터 (HELLGATER) - 시스템 아키텍처 설계

## 1. 전체 시스템 구조

```
┌─────────────────────────────────────────────────────────────┐
│                        클라이언트                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           React Web App (Hybrid)                     │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │   │
│  │  │ UI Layer   │  │ Game Layer │  │ Data Layer │    │   │
│  │  │            │  │            │  │            │    │   │
│  │  │ - 캐릭터   │  │ - 경험치   │  │ - Redux    │    │   │
│  │  │ - 맵       │  │ - 레벨     │  │ - 상태관리  │    │   │
│  │  │ - 프로필   │  │ - 스킬트리 │  │ - API 통신  │    │   │
│  │  └────────────┘  └────────────┘  └────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS/REST API
┌───────────────────────────▼─────────────────────────────────┐
│                      백엔드 서버 (Node.js)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   API Gateway                        │   │
│  │         (Express.js + JWT Authentication)           │   │
│  └───────┬──────────────────────────────────────────────┘   │
│          │                                                   │
│  ┌───────▼───────┐  ┌──────────┐  ┌────────────────┐       │
│  │ Game Engine   │  │ RM       │  │ Upload         │       │
│  │               │  │ Analysis │  │ Service        │       │
│  │ - 경험치 계산 │  │ Engine   │  │                │       │
│  │ - 레벨업 로직 │  │          │  │ - 영상 인코딩  │       │
│  │ - 스킬트리    │  │ - 1RM    │  │ - 이미지 압축  │       │
│  │ - 맵 진행     │  │ - 등급   │  │ - S3 업로드    │       │
│  └───────────────┘  └──────────┘  └────────────────┘       │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    데이터베이스 (PostgreSQL)                   │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │ Users   │  │ Workout │  │ Level   │  │ Skills  │       │
│  │ Table   │  │ Records │  │ & EXP   │  │ Tree    │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    외부 서비스                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ AWS S3   │  │ GPS API  │  │ 웨어러블 │  │ 영양DB   │   │
│  │ (미디어) │  │ (위치)   │  │ API      │  │ API      │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 기술 스택 상세

### 2.1 프론트엔드
```
- Framework: React 18.x + TypeScript
- 상태 관리: Redux Toolkit (전역), React Query (서버 상태)
- 라우팅: React Router v6
- 스타일링: Tailwind CSS + styled-components
- 애니메이션: Framer Motion (레벨업, 스킬 해금 이펙트)
- 차트: Recharts (통계 그래프)
- PWA: Workbox (오프라인 지원)
- 빌드: Vite
```

### 2.2 백엔드
```
- Runtime: Node.js 20.x LTS
- Framework: Express.js 4.x
- 인증: JWT (Access Token + Refresh Token)
- ORM: Prisma (타입 안전성)
- 파일 업로드: Multer + Sharp (이미지 처리)
- 영상 처리: FFmpeg (인코딩/압축)
- 스케줄링: node-cron (일일 퀘스트 리셋)
- 로깅: Winston + Morgan
```

### 2.3 데이터베이스
```
- 주 DB: PostgreSQL 15.x
  - 사용자 데이터
  - 운동 기록
  - 레벨/경험치
  - 스킬트리

- 캐시: Redis 7.x
  - 세션 관리
  - 랭킹 캐시
  - API Rate Limiting
```

### 2.4 인프라 (MVP 단계)
```
- 배포: Vercel (프론트), Railway (백엔드)
- DB 호스팅: Supabase (PostgreSQL + Storage)
- CDN: Cloudflare
- 모니터링: Sentry (에러 추적)
```

---

## 3. 디렉토리 구조

```
hellgater/
├── client/                    # 프론트엔드 (React)
│   ├── public/
│   │   ├── images/
│   │   │   ├── characters/   # 캐릭터 이미지
│   │   │   ├── maps/         # 맵 배경
│   │   │   └── skills/       # 스킬 아이콘
│   │   └── sounds/           # 효과음
│   ├── src/
│   │   ├── components/
│   │   │   ├── character/
│   │   │   │   ├── CharacterCard.tsx
│   │   │   │   ├── CharacterStats.tsx
│   │   │   │   └── LevelUpModal.tsx
│   │   │   ├── workout/
│   │   │   │   ├── WorkoutRecorder.tsx
│   │   │   │   ├── BodyPartSelector.tsx
│   │   │   │   └── ExerciseHistory.tsx
│   │   │   ├── map/
│   │   │   │   ├── MapCanvas.tsx
│   │   │   │   ├── StageNode.tsx
│   │   │   │   └── AttributeMap.tsx
│   │   │   ├── skilltree/
│   │   │   │   ├── SkillTreeCanvas.tsx
│   │   │   │   ├── SkillNode.tsx
│   │   │   │   └── SkillTooltip.tsx
│   │   │   └── common/
│   │   │       ├── Button.tsx
│   │   │       ├── Modal.tsx
│   │   │       └── LoadingSpinner.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── CharacterCreate.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── WorkoutRecord.tsx
│   │   │   ├── MapExplore.tsx
│   │   │   ├── SkillTree.tsx
│   │   │   ├── Community.tsx
│   │   │   └── Settings.tsx
│   │   ├── store/
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.ts
│   │   │   │   ├── characterSlice.ts
│   │   │   │   ├── workoutSlice.ts
│   │   │   │   └── mapSlice.ts
│   │   │   └── store.ts
│   │   ├── services/
│   │   │   ├── api/
│   │   │   │   ├── auth.api.ts
│   │   │   │   ├── workout.api.ts
│   │   │   │   ├── character.api.ts
│   │   │   │   └── map.api.ts
│   │   │   └── gameEngine/
│   │   │       ├── ExpCalculator.ts
│   │   │       ├── LevelSystem.ts
│   │   │       └── SkillTreeManager.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useWorkout.ts
│   │   │   └── useCharacter.ts
│   │   ├── utils/
│   │   │   ├── rmCalculator.ts   # 1RM 계산
│   │   │   ├── expFormula.ts     # 경험치 공식
│   │   │   └── dateFormatter.ts
│   │   ├── types/
│   │   │   ├── character.types.ts
│   │   │   ├── workout.types.ts
│   │   │   ├── skill.types.ts
│   │   │   └── map.types.ts
│   │   ├── constants/
│   │   │   ├── bodyParts.ts
│   │   │   ├── attributes.ts
│   │   │   └── levels.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                    # 백엔드 (Node.js)
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── workout.controller.ts
│   │   │   ├── character.controller.ts
│   │   │   ├── skill.controller.ts
│   │   │   └── map.controller.ts
│   │   ├── services/
│   │   │   ├── gameEngine/
│   │   │   │   ├── ExpEngine.ts
│   │   │   │   ├── LevelEngine.ts
│   │   │   │   ├── SkillTreeEngine.ts
│   │   │   │   └── MapEngine.ts
│   │   │   ├── rmAnalysis/
│   │   │   │   ├── RMCalculator.ts
│   │   │   │   └── GradeEvaluator.ts
│   │   │   └── upload/
│   │   │       ├── VideoProcessor.ts
│   │   │       └── ImageProcessor.ts
│   │   ├── models/           # Prisma schema
│   │   │   └── schema.prisma
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   └── errorHandler.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── workout.routes.ts
│   │   │   ├── character.routes.ts
│   │   │   ├── skill.routes.ts
│   │   │   └── map.routes.ts
│   │   ├── utils/
│   │   │   ├── jwt.ts
│   │   │   ├── logger.ts
│   │   │   └── validators.ts
│   │   ├── types/
│   │   │   ├── express.d.ts
│   │   │   └── game.types.ts
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── redis.ts
│   │   │   └── aws.ts
│   │   └── app.ts
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                    # 공유 타입 & 상수
│   ├── types/
│   │   ├── character.ts
│   │   ├── workout.ts
│   │   └── game.ts
│   └── constants/
│       ├── bodyParts.ts
│       ├── exercises.ts
│       └── levels.ts
│
├── docs/                      # 설계 문서
│   ├── ARCHITECTURE.md       # (현재 파일)
│   ├── DATABASE_SCHEMA.md
│   ├── API_DESIGN.md
│   ├── GAME_LOGIC.md
│   └── DEPLOYMENT.md
│
├── 레퍼런스/                  # 기획 자료
├── .gitignore
├── package.json              # Monorepo root
└── README.md
```

---

## 4. 핵심 모듈 설명

### 4.1 게임 엔진 (Game Engine)

**위치**: `server/src/services/gameEngine/`

**역할**:
- 운동 기록 → 경험치 변환
- 레벨업 조건 체크 및 실행
- 스킬트리 잠금/해금 로직
- 맵 진행 상태 관리

**주요 클래스**:
```typescript
class ExpEngine {
  calculateWorkoutExp(workout: WorkoutRecord): ExpGain
  applyExpToBodyPart(userId: string, bodyPart: BodyPart, exp: number): LevelUpResult
}

class LevelEngine {
  checkLevelUp(currentExp: number, currentLevel: number): boolean
  getNextLevelExp(level: number): number
  getLevelRewards(level: number): Reward[]
}

class SkillTreeEngine {
  checkSkillUnlock(userId: string, skillId: string): boolean
  unlockSkill(userId: string, skillId: string): void
  getAvailableSkills(userId: string): Skill[]
}
```

### 4.2 RM 분석 엔진 (RM Analysis Engine)

**위치**: `server/src/services/rmAnalysis/`

**역할**:
- 1RM 계산 (무게 + 횟수 → 최대 무게)
- 체중 대비 등급 평가 (브론즈 ~ 챌린저)
- 경험치 배율 계산

**공식**:
```typescript
class RMCalculator {
  // 1RM = 현재무게 + (무게 × 0.025 × 횟수)
  calculate1RM(weight: number, reps: number): number

  // RM 백분율표 기반 변환
  getRMPercentage(reps: number): number
}

class GradeEvaluator {
  // 체중별 등급 테이블 참조
  evaluateGrade(bodyWeight: number, weight: number, exercise: string): Grade
}
```

### 4.3 상태 관리 (State Management)

**프론트엔드 Redux Slices**:

1. **authSlice**: 로그인 상태, 토큰
2. **characterSlice**: 캐릭터 정보, 레벨, 능력치
3. **workoutSlice**: 운동 기록, 진행 중인 운동
4. **mapSlice**: 맵 진행 상태, 현재 스테이지
5. **skillSlice**: 스킬트리 상태, 해금된 스킬

---

## 5. 데이터 흐름 (운동 기록 → 레벨업)

```
┌──────────────────┐
│ 1. 사용자가 운동 │
│    기록 입력     │
│  (무게, 횟수)    │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│ 2. 프론트엔드 WorkoutRecorder │
│    - 입력 검증                │
│    - POST /api/workouts       │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ 3. 백엔드 WorkoutController   │
│    - 인증 확인                │
│    - 데이터 검증              │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ 4. RMCalculator               │
│    - 1RM 계산                 │
│    - 등급 평가                │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ 5. ExpEngine                  │
│    - 경험치 계산              │
│    - 부위별 경험치 적용       │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ 6. LevelEngine                │
│    - 레벨업 체크              │
│    - 보상 지급                │
│    - 스킬 해금 체크           │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ 7. DB 저장                    │
│    - workout_records          │
│    - user_body_parts (exp)    │
│    - user_levels              │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ 8. 응답 반환                  │
│    {                          │
│      workout: {...},          │
│      expGained: 150,          │
│      levelUp: true,           │
│      newLevel: 5,             │
│      unlockedSkills: [...]    │
│    }                          │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ 9. 프론트엔드 UI 업데이트     │
│    - 경험치 바 애니메이션     │
│    - 레벨업 모달 표시         │
│    - 스킬 해금 알림           │
└──────────────────────────────┘
```

---

## 6. 확장성 고려사항

### 6.1 마이크로서비스 전환 (향후)
현재는 모놀리식이지만, 사용자 증가 시 다음과 같이 분리:
- **Auth Service**: 인증/인가
- **Workout Service**: 운동 기록
- **Game Service**: 게임 로직 (경험치, 레벨)
- **Community Service**: 커뮤니티, 랭킹

### 6.2 캐싱 전략
- **Redis**: 랭킹, 세션, API 응답 캐시
- **CDN**: 정적 이미지 (캐릭터, 맵)
- **Service Worker**: 오프라인 운동 기록

### 6.3 성능 최적화
- **DB Indexing**: user_id, body_part, created_at
- **Connection Pooling**: Prisma 커넥션 풀
- **Image Optimization**: WebP 변환, 리사이징
- **Code Splitting**: React.lazy() 페이지별 분할

---

## 7. 보안 설계

### 7.1 인증 & 인가
```typescript
// JWT 토큰 구조
{
  accessToken: {
    payload: { userId, email },
    expiresIn: '15m'
  },
  refreshToken: {
    payload: { userId },
    expiresIn: '7d'
  }
}
```

### 7.2 데이터 보호
- **비밀번호**: bcrypt 해싱 (salt rounds: 12)
- **민감 정보**: 암호화 (AES-256)
- **API Rate Limiting**: 분당 100 요청

### 7.3 입력 검증
- **프론트**: React Hook Form + Zod
- **백엔드**: Express Validator + Joi

---

## 8. 모니터링 & 로깅

### 8.1 에러 추적
- **Sentry**: 프론트/백엔드 에러 모니터링
- **Source Maps**: 프로덕션 디버깅

### 8.2 로깅
```typescript
// Winston 로그 레벨
{
  error: 에러 발생 (DB 연결 실패, API 500),
  warn: 경고 (레이트 리밋 근접, 느린 쿼리),
  info: 정보 (사용자 로그인, 운동 기록),
  debug: 디버그 (개발 환경)
}
```

### 8.3 분석
- **Google Analytics**: 사용자 행동 분석
- **Custom Events**: 레벨업, 스킬 해금, 운동 완료

---

## 9. 개발 우선순위

### Phase 1: MVP (핵심 기능)
1. 회원가입/로그인
2. 캐릭터 생성
3. 운동 기록 (7개 부위)
4. 경험치 & 레벨 시스템
5. 프로필 화면

### Phase 2: 게임화 강화
1. 스킬트리 시스템
2. 맵 탐험 시스템
3. 일일 퀘스트
4. 배지 & 업적

### Phase 3: 커뮤니티
1. 커뮤니티 피드
2. 랭킹 시스템
3. 친구 추가

### Phase 4: 수익화
1. 인벤토리 광고
2. 프리미엄 구독
3. 음식 분석 AI

---

**다음 단계**: DATABASE_SCHEMA.md에서 상세 테이블 설계
