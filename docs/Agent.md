# 헬게이터 (HELLGATER) - 프로젝트 개요

## 프로젝트 소개

**헬게이터**는 운동을 RPG 게임처럼 즐길 수 있도록 만든 혁신적인 피트니스 AI 앱입니다. 과학적 근거를 바탕으로 한 정확한 운동 분석과 재미있는 게임화 요소를 결합하여, 초보자부터 전문가까지 모두가 즐겁게 운동할 수 있도록 설계되었습니다.

### 핵심 컨셉
- **게임화된 피트니스**: 운동을 RPG처럼 즐기기
- **과학적 정확성**: 연구 기반의 1RM 계산, 등급 평가, 칼로리 계산
- **AI 기반 개인화**: 사용자 수준에 맞춘 맞춤형 추천
- **스토리텔링**: 마스코트 "바알시불"과 함께하는 25주 커리큘럼

---

## 주요 기능

### 1. RPG 캐릭터 시스템
- **7개 신체 부위별 레벨링**: 어깨, 가슴, 등, 팔, 복근, 엉덩이, 다리
- **전체 레벨**: 부위별 레벨의 평균값
- **5속성 시스템**: 땅(근력), 불(지구력), 바람(민첩), 물(유연), 정신(집중)
- **레벨업 보상**: 스킬 포인트, 칭호 등

### 2. 과학적 운동 분석
- **다중 1RM 계산 공식**: Epley, Brzycki, Lombardi 등 9가지 공식 지원
- **운동별 최적 공식 선택**: 복합 운동 vs 고립 운동, 상체 vs 하체에 따라 자동 선택
- **등급 평가**: ACSM, NSCA 기준 기반 7단계 등급 (BRONZE ~ CHALLENGER)
- **연령 조정**: 연령대별 자연적 체력 감소 반영
- **개인화된 칼로리 계산**: METs 기반, 심박수 기반 계산 지원

### 3. 프로그레시브 오버로드 추천
- **자동 운동 추천**: 최근 운동 기록 분석 기반
- **RPE 기반 조정**: Rate of Perceived Exertion에 따른 강도 조정
- **과학적 근거**: NSCA 프로그레시브 오버로드 원칙 적용
- **안전 경고**: 과도한 진행 시 경고 메시지

### 4. 게임화 요소
- **스킬트리 시스템**: 운동별 스킬 해금 및 업그레이드
- **맵 탐험**: 25주 커리큘럼을 맵 형태로 진행
- **일일 퀘스트**: 매일 새로운 도전 과제
- **업적 시스템**: 다양한 목표 달성 시 업적 획득
- **레벨업 애니메이션**: 화려한 레벨업 축하 모달

### 5. 커뮤니티 기능
- **게시글 & 댓글**: 운동 인증, 팁 공유
- **친구 시스템**: 친구 추가 및 활동 확인
- **랭킹**: 부위별, 전체 레벨 랭킹

---

## 시스템 아키텍처

### 기술 스택

**프론트엔드**:
- React 18 + TypeScript
- Redux Toolkit (상태 관리)
- React Query (서버 상태 관리)
- Tailwind CSS (스타일링)
- Framer Motion (애니메이션)
- Vite (빌드 도구)

**백엔드**:
- Node.js + Express.js
- Prisma (ORM)
- PostgreSQL (데이터베이스)
- JWT (인증)
- Multer + Sharp (이미지 처리)
- FFmpeg (비디오 처리)

**인프라**:
- Vercel (프론트엔드 배포)
- Railway/Supabase (백엔드/DB)
- Cloudflare (CDN)
- Sentry (에러 모니터링)

### 디렉토리 구조

```
hellgater/
├── client/          # React 프론트엔드
│   ├── src/
│   │   ├── components/  # 재사용 가능한 컴포넌트
│   │   ├── pages/       # 페이지 컴포넌트
│   │   ├── hooks/       # 커스텀 훅
│   │   ├── services/    # API 서비스
│   │   └── store/       # Redux store
│   └── public/
│
├── server/          # Node.js 백엔드
│   ├── src/
│   │   ├── controllers/  # 라우트 핸들러
│   │   ├── services/     # 비즈니스 로직
│   │   │   ├── rmAnalysis/        # 1RM 분석
│   │   │   ├── gameEngine/        # 게임 로직
│   │   │   └── progressiveOverload/ # 프로그레시브 오버로드
│   │   ├── middleware/   # 미들웨어
│   │   └── routes/       # API 라우트
│   └── prisma/      # Prisma 스키마
│
├── shared/          # 공유 타입 정의
│   └── types/
│
└── docs/            # 문서
    ├── ARCHITECTURE.md
    ├── DATABASE_SCHEMA.md
    ├── GAME_LOGIC.md
    ├── CONTENT_STRATEGY.md
    └── IMPROVEMENT_PLAN.md
```

---

## 최근 개선 사항 (2024)

### 1. RM 계산 공식 개선 ✅
- **다중 공식 지원**: 9가지 과학적 검증된 공식 구현
  - Epley, Brzycki, Lombardi, O'Conner, Wathen, Lander, Mayhew, Abadie, Wendler
- **운동별 최적 공식 선택**: 복합 운동/고립 운동, 상체/하체에 따라 자동 선택
- **평균값 계산**: 모든 공식의 평균값으로 더 정확한 추정
- **Rep 범위별 추천**: 1-3 reps (Brzycki), 4-6 reps (Epley), 7-10 reps (Lombardi)

**파일**: `server/src/services/rmAnalysis/rmAnalysisService.ts`

### 2. 등급 기준 과학적 근거화 ✅
- **연구 출처 명시**: ACSM, NSCA, KOSFA 기준 반영
- **연령 조정**: 18-25세 기준, 연령대별 자동 조정 (최대 25% 감소)
- **등급별 의미 설명**: 각 등급의 백분위수, 건강상 이점, 연구 근거 제공
- **문서화**: `server/src/services/rmAnalysis/gradeThresholds.ts`

### 3. 칼로리 계산 정확도 향상 ✅
- **METs 기반 계산**: ACSM 기준 운동별 METs 값 적용
- **개인화된 계산**: 체중, 나이, 성별, 운동 강도 반영
- **EPOC 계산**: 운동 후 과소비산소 소모량 포함
- **심박수 기반 계산**: Katch-McArdle 공식 지원 (가장 정확)

**파일**: `server/src/services/gameEngine/calorieCalculationService.ts`

### 4. 프로그레시브 오버로드 자동 추천 ✅
- **최근 운동 기록 분석**: 4주간의 운동 패턴 분석
- **RPE 기반 추천**: Rate of Perceived Exertion에 따른 강도 조정
- **과학적 원칙 적용**: NSCA 프로그레시브 오버로드 원칙
- **안전 경고**: 과도한 진행 시 경고 메시지

**파일**: 
- `server/src/services/gameEngine/progressiveOverloadService.ts`
- `server/src/controllers/progressiveOverload.controller.ts`
- `server/src/routes/exercise.routes.ts`

### 5. 레벨업 애니메이션 및 즉각적 피드백 ✅
- **레벨업 감지**: 경험치 추가 시 자동 레벨업 체크
- **화려한 애니메이션**: Framer Motion 기반 레벨업 모달
- **보상 표시**: 스킬 포인트, 칭호 등 보상 안내
- **햅틱 피드백**: 모바일 진동 지원

**파일**:
- `server/src/services/gameEngine/levelUpService.ts`
- `client/src/components/common/LevelUpModal.tsx`
- `client/src/pages/WorkoutRecord.tsx`

---

## 데이터베이스 스키마

### 주요 테이블

**사용자 & 캐릭터**:
- `users`: 사용자 정보
- `characters`: 캐릭터 정보 (전체 레벨, 경험치)
- `user_body_parts`: 부위별 레벨 및 경험치

**운동 & 기록**:
- `exercises`: 운동 종목 마스터 데이터
- `workout_records`: 운동 기록
- `body_parts`: 신체 부위 마스터 데이터

**게임화**:
- `skills`: 스킬 마스터 데이터
- `user_skills`: 사용자 스킬 해금 상태
- `map_stages`: 맵 스테이지 데이터
- `user_map_progress`: 사용자 맵 진행도
- `achievements`: 업적 마스터 데이터
- `user_achievements`: 사용자 업적 달성 상태
- `daily_quests`: 일일 퀘스트 마스터 데이터
- `user_quests`: 사용자 퀘스트 진행 상태

**커뮤니티**:
- `posts`: 게시글
- `comments`: 댓글
- `post_likes`: 좋아요
- `friendships`: 친구 관계

**커리큘럼**:
- `curriculum_weeks`: 25주 커리큘럼 주차 정보
- `content_modules`: 콘텐츠 모듈 (비디오, 퀴즈 등)
- `user_curriculum_progress`: 사용자 커리큘럼 진행도
- `user_content_completion`: 콘텐츠 완료 기록

**상세 스키마**: `docs/DATABASE_SCHEMA.md` 참고

---

## API 엔드포인트

### 인증
- `POST /api/v1/auth/register` - 회원가입
- `POST /api/v1/auth/login` - 로그인
- `POST /api/v1/auth/refresh` - 토큰 갱신
- `GET /api/v1/auth/me` - 내 정보 조회

### 캐릭터
- `POST /api/v1/characters` - 캐릭터 생성
- `GET /api/v1/characters/me` - 내 캐릭터 조회
- `PATCH /api/v1/characters/me` - 캐릭터 정보 수정

### 운동 기록
- `POST /api/v1/workouts` - 운동 기록 생성
- `GET /api/v1/workouts` - 운동 기록 조회 (필터링 지원)

### 운동 종목
- `GET /api/v1/exercises/body-parts` - 부위 목록 조회
- `GET /api/v1/exercises/by-body-part/:bodyPartId` - 부위별 운동 목록
- `GET /api/v1/exercises/:exerciseId` - 운동 상세 정보
- `GET /api/v1/exercises/:exerciseId/progressive-overload` - 프로그레시브 오버로드 추천

### 레벨테스트
- `GET /api/v1/level-tests/available` - 가능한 레벨테스트 조회
- `POST /api/v1/level-tests` - 레벨테스트 시작
- `POST /api/v1/level-tests/:levelTestId/submit` - 레벨테스트 제출

**상세 API 설계**: `docs/API_DESIGN.md` 참고

---

## 게임 로직

### 경험치 계산
- **기본 경험치**: `sets × reps × weight × difficultyMultiplier`
- **등급 보너스**: BRONZE(0%) ~ CHALLENGER(+150%)
- **볼륨 보너스**: 세트 수에 따른 추가 보너스
- **PR 보너스**: 개인 기록 달성 시 +50%
- **레벨 페널티**: 레벨이 높을수록 경험치 감소 (최대 -60%)

### 레벨업 시스템
- **필요 경험치**: `1000 × 1.15^(level-1)` (지수 곡선)
- **레벨업 보상**: 
  - 5레벨마다 스킬 포인트 +1
  - 10레벨마다 칭호 획득

### 1RM 계산
- **다중 공식 지원**: 9가지 공식 중 최적 공식 선택
- **운동별 최적화**: 복합 운동/고립 운동에 따라 다른 공식 사용
- **신뢰도 표시**: Rep 범위에 따른 신뢰도 (0-1)

**상세 로직**: `docs/GAME_LOGIC.md` 참고

---

## 개발 가이드

### Docker를 사용한 실행 (권장) 🐳

**가장 쉬운 방법! 어느 환경에서든 동일하게 실행**

```bash
# 1. 환경 변수 설정 (선택사항)
cp .env.example .env

# 2. Docker로 실행
npm run docker:dev

# 3. 접속
# 프론트엔드: http://localhost:8100
# 백엔드: http://localhost:8200
# PostgreSQL: localhost:8300
```

**자동화된 기능:**
- ✅ 데이터베이스 마이그레이션 자동 실행 (수동 명령 불필요)
- ✅ Prisma Client 자동 생성
- ✅ 개발 환경: 마이그레이션 파일이 없으면 `db push` 자동 실행
- ✅ 프로덕션 환경: `migrate deploy` 자동 실행

**자세한 내용**: [Docker 가이드](../DOCKER_GUIDE.md)

### 로컬 개발 환경 설정

1. **의존성 설치**:
```bash
# 루트
npm install

# 클라이언트
cd client && npm install

# 서버
cd server && npm install
```

2. **환경 변수 설정**:
- `client/.env`: `VITE_API_URL=http://localhost:4000/api/v1`
- `server/.env`: 데이터베이스 연결 정보 등

3. **데이터베이스 마이그레이션** (Docker 사용 시 자동 실행됨):
```bash
cd server
npx prisma migrate dev
npx prisma generate
```

4. **개발 서버 실행**:
```bash
# 클라이언트 (포트 5173)
cd client && npm run dev

# 서버 (포트 4000)
cd server && npm run dev
```

### 코드 스타일
- **TypeScript**: 엄격한 타입 체크
- **ESLint + Prettier**: 코드 포맷팅 자동화
- **커밋 메시지**: Conventional Commits 형식

### 테스트
- **단위 테스트**: Jest (계획 중)
- **통합 테스트**: Supertest (계획 중)
- **E2E 테스트**: Playwright (계획 중)

---

## 향후 계획

### Phase 1: 과학적 검증 강화 (진행 중)
- ✅ RM 계산 공식 개선
- ✅ 등급 기준 과학적 근거화
- ✅ 칼로리 계산 정확도 향상
- ✅ 프로그레시브 오버로드 추천
- ✅ 레벨업 애니메이션

### Phase 2: 게임화 강화
- 스킬트리 시스템 완성
- 맵 탐험 시스템 완성
- 일일 퀘스트 시스템
- 업적 시스템

### Phase 3: AI 기능
- AI 자세 교정 (비디오 분석)
- AI 운동 추천 (개인화)
- AI 식단 추천

### Phase 4: 커뮤니티
- 게시글 & 댓글 시스템
- 친구 시스템
- 랭킹 시스템

### Phase 5: 수익화
- 인벤토리 광고 시스템
- 프리미엄 구독
- 제휴 링크

**상세 계획**: `docs/IMPROVEMENT_PLAN.md` 참고

---

## 참고 문서

- **아키텍처**: `docs/ARCHITECTURE.md`
- **데이터베이스 스키마**: `docs/DATABASE_SCHEMA.md`
- **게임 로직**: `docs/GAME_LOGIC.md`
- **콘텐츠 전략**: `docs/CONTENT_STRATEGY.md`
- **개선 계획**: `docs/IMPROVEMENT_PLAN.md`
- **프론트엔드 설계**: `docs/FRONTEND_DESIGN.md`

---

## 라이선스

프로젝트 라이선스 정보

---

**최종 업데이트**: 2024년
**버전**: 1.0.0

