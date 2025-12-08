# 🏋️ 헬게이터 (HELLGATER)

**헬스의 게임화** - 운동을 RPG처럼 즐기세요!

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)

---

## 📖 소개

헬게이터는 **운동 기록과 관리를 게임화(Gamification)**하여 재미있게 만드는 피트니스 앱입니다.

### 핵심 기능

- 🎮 **RPG 레벨 시스템**: 운동할수록 캐릭터와 부위별 레벨 상승
- 🌳 **스킬트리**: 운동 종목을 게임처럼 해금
- 🗺️ **맵 탐험**: 25주 커리큘럼을 맵 형태로 진행
- 📊 **RM 분석**: 1RM 계산과 등급 평가 (브론즈~챌린저)
- 🏆 **퀘스트 & 업적**: 일일 퀘스트, 업적 시스템
- 👥 **커뮤니티**: 운동 기록 공유, 랭킹 시스템

---

## 🏗️ 프로젝트 구조

```
hellgater/
├── client/              # 프론트엔드 (React + TypeScript + Vite)
├── server/              # 백엔드 (Node.js + Express + Prisma)
├── shared/              # 공유 타입 & 상수
├── docs/                # 설계 문서
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── GAME_LOGIC.md
│   ├── API_DESIGN.md
│   └── FRONTEND_DESIGN.md
├── 레퍼런스/            # 기획 자료
└── README.md
```

---

## 🚀 빠른 시작

### 방법 1: Docker 사용 (권장) 🐳

**가장 쉬운 방법! 환경 설정 불필요, 어느 운영체제에서든 동일하게 실행**

#### 빠른 시작

```bash
# 1. Docker Desktop 설치
# Windows/Mac: https://www.docker.com/products/docker-desktop/
# Linux: sudo apt-get install docker.io docker-compose

# 2. 프로젝트 클론
git clone https://github.com/yourusername/hellgater.git
cd hellgater

# 3. 환경 변수 설정 (선택사항, 기본값으로도 실행 가능)
cp .env.example .env

# 4. Docker로 실행
npm run docker:dev

# 5. 브라우저에서 접속
# ⚠️ 주의: 포트 충돌 방지를 위해 비표준 포트 사용!
# 프론트엔드: http://localhost:8100 (일반적: 3000)
# 백엔드 API: http://localhost:8200 (일반적: 4000)
# Health Check: http://localhost:8200/health
# PostgreSQL: localhost:8300 (일반적: 5432)
# 자세한 포트 설정: PORT_CONFIGURATION.md 참고

# ✅ 자동화된 기능:
# - 데이터베이스 마이그레이션 자동 실행 (수동 명령 불필요!)
# - Prisma Client 자동 생성
# - 개발 환경: 마이그레이션 파일이 없으면 자동으로 db push 실행
```

#### 주요 Docker 명령어

```bash
# 개발 환경 실행
npm run docker:dev              # 포그라운드 실행
npm run docker:dev:build        # 재빌드 후 실행
npm run docker:dev:down         # 중지 및 제거

# 프로덕션 환경 실행
npm run docker:prod            # 프로덕션 실행
npm run docker:prod:build      # 프로덕션 재빌드
npm run docker:prod:down       # 프로덕션 중지

# 로그 확인
npm run docker:logs            # 모든 서비스 로그
docker-compose logs -f server  # 특정 서비스 로그

# 정리
npm run docker:clean           # 모든 컨테이너/볼륨 삭제
```

**자세한 내용은 [📖 Docker 가이드](./DOCKER_GUIDE.md) 참고**

### 방법 2: 로컬 개발 환경

#### 필수 요구사항

- **Node.js**: >= 20.0.0
- **npm**: >= 10.0.0
- **PostgreSQL**: >= 15.x

#### 설치

1. **저장소 클론**

```bash
git clone https://github.com/yourusername/hellgater.git
cd hellgater
```

2. **의존성 설치**

```bash
npm install
```

3. **환경 변수 설정**

```bash
cd server
cp .env.example .env
# .env 파일에서 DATABASE_URL, JWT 시크릿 수정
```

4. **데이터베이스 설정**

```bash
# PostgreSQL 데이터베이스 생성
createdb hellgater

# 마이그레이션 실행
npx prisma migrate dev --name init
npx prisma generate
```

5. **개발 서버 실행**

```bash
cd ..
npm run dev
```

- **프론트엔드**: http://localhost:3000
- **백엔드**: http://localhost:4000

자세한 내용은 **[📖 시작 가이드](./GETTING_STARTED.md)** 참고

---

## 📚 기술 스택

### 프론트엔드
- React 18
- TypeScript
- Vite
- Redux Toolkit
- React Query
- Tailwind CSS
- Framer Motion
- Recharts

### 백엔드
- Node.js 20
- Express
- Prisma (ORM)
- PostgreSQL
- JWT
- bcrypt
- Winston (로깅)

### 공유
- TypeScript
- Zod (스키마 검증)

---

## 🗂️ 주요 디렉토리

### `client/src/`
```
├── components/       # React 컴포넌트
├── pages/            # 페이지 컴포넌트
├── store/            # Redux 스토어
├── services/         # API 서비스
├── hooks/            # Custom React Hooks
├── utils/            # 유틸리티 함수
├── types/            # 타입 정의
└── constants/        # 상수
```

### `server/src/`
```
├── controllers/      # API 컨트롤러
├── services/         # 비즈니스 로직
│   ├── gameEngine/   # 게임 시스템 로직
│   └── rmAnalysis/   # RM 분석 엔진
├── routes/           # API 라우트
├── middleware/       # Express 미들웨어
├── utils/            # 유틸리티 함수
├── types/            # 타입 정의
└── config/           # 설정 파일
```

### `shared/`
```
├── types/            # 공유 타입
└── constants/        # 공유 상수
```

---

## 📋 스크립트

### 개발
```bash
npm run dev              # 전체 개발 서버 실행
npm run dev:client       # 프론트엔드만 실행
npm run dev:server       # 백엔드만 실행
```

### 빌드
```bash
npm run build            # 전체 빌드
npm run build:client     # 프론트엔드 빌드
npm run build:server     # 백엔드 빌드
```

### Docker
```bash
npm run docker:dev           # Docker 개발 환경 실행
npm run docker:dev:build     # 재빌드 후 실행
npm run docker:dev:down      # 개발 환경 중지
npm run docker:prod          # 프로덕션 환경 실행
npm run docker:prod:build    # 프로덕션 재빌드
npm run docker:prod:down     # 프로덕션 중지
npm run docker:logs          # 로그 실시간 확인
npm run docker:clean         # 모든 컨테이너/볼륨 삭제
```

### 유틸리티
```bash
npm run lint             # 코드 검사
npm run format           # 코드 포맷팅
```

---

## 🎯 개발 로드맵

### Phase 1: MVP (0-8주) ✅ **현재 단계**
- [x] 프로젝트 초기 설정
- [x] 데이터베이스 스키마 설계
- [ ] 인증 시스템 (회원가입/로그인)
- [ ] 캐릭터 생성
- [ ] 운동 기록 & 경험치 시스템
- [ ] 레벨업 시스템

### Phase 2: 게임화 강화 (9-16주)
- [ ] 스킬트리 시스템
- [ ] 맵 탐험 시스템
- [ ] 일일 퀘스트
- [ ] 업적 시스템

### Phase 3: 커뮤니티 (17-22주)
- [ ] 게시글 & 댓글
- [ ] 랭킹 시스템
- [ ] 친구 시스템

### Phase 4: 수익화 (23-30주)
- [ ] 인벤토리 광고
- [ ] 프리미엄 구독
- [ ] 음식 분석 AI

---

## 📖 설계 문서

상세한 설계는 [`docs/`](./docs) 폴더 참조:

- [시스템 아키텍처](./docs/ARCHITECTURE.md)
- [데이터베이스 스키마](./docs/DATABASE_SCHEMA.md)
- [게임 시스템 로직](./docs/GAME_LOGIC.md)
- [API 설계](./docs/API_DESIGN.md)
- [프론트엔드 & 로드맵](./docs/FRONTEND_DESIGN.md)

---

## 🤝 기여

기여는 언제든 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일 참조

---

## 👨‍💻 개발자

**배성원** - [@baesungwon](https://github.com/baesungwon)

---

## 🙏 감사의 글

- [Slay the Spire](https://www.megacrit.com/) - 덱빌딩 게임 영감
- [Habitica](https://habitica.com/) - 게임화 아이디어
- [Vingle](https://www.vingle.net/) - 커뮤니티 콘텐츠 기반

---

**Made with ❤️ by FunFun Health Team**
