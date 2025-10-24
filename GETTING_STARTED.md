# 🚀 헬게이터(HELLGATER) - 윈도우 최초 실행 가이드

이 문서는 윈도우 환경에서 헬게이터 프로젝트를 처음 실행하는 방법을 안내합니다.

---

## 📋 사전 요구사항

다음 프로그램들이 설치되어 있어야 합니다:

1. **Node.js v20 이상** - [다운로드](https://nodejs.org/)
2. **PostgreSQL 15 이상** - [다운로드](https://www.postgresql.org/download/windows/)
3. **Git** - [다운로드](https://git-scm.com/download/win)

### 설치 확인

명령 프롬프트(CMD) 또는 PowerShell에서 다음 명령어로 설치를 확인하세요:

```bash
node --version    # v20.0.0 이상이어야 함
npm --version     # 9.0.0 이상이어야 함
psql --version    # PostgreSQL 15 이상이어야 함
```

---

## 1️⃣ PostgreSQL 데이터베이스 설정

### 1-1. PostgreSQL 서비스 실행

- Windows 검색에서 "서비스"를 열기
- "postgresql-x64-15" (또는 설치된 버전) 찾기
- 실행 중이 아니면 "시작" 클릭

### 1-2. 데이터베이스 생성

**방법 A: pgAdmin 사용 (GUI)**

1. pgAdmin 4 실행
2. 왼쪽 트리에서 Servers → PostgreSQL 15 → Databases 우클릭
3. Create → Database 선택
4. Database name: `hellgater` 입력
5. Save 클릭

**방법 B: 명령줄 사용**

```bash
# PostgreSQL 명령줄 접속 (비밀번호 입력 필요)
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE hellgater;

# 확인
\l

# 종료
\q
```

---

## 2️⃣ 환경 변수 설정

### 2-1. `.env` 파일 생성

프로젝트 루트의 `server` 폴더에 `.env` 파일이 이미 생성되어 있습니다.

### 2-2. `.env` 파일 수정

`G:\ai_coding\hellgater\server\.env` 파일을 텍스트 에디터로 열어 다음 값들을 수정하세요:

```env
# Server
NODE_ENV=development
PORT=4000
CLIENT_URL=http://localhost:3000

# Database - ⚠️ 여기를 수정하세요!
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/hellgater?schema=public"
# YOUR_PASSWORD를 PostgreSQL 설치 시 설정한 비밀번호로 변경하세요

# JWT - ⚠️ 보안을 위해 변경 권장!
JWT_ACCESS_SECRET=your-super-secret-access-key-change-me-12345
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-me-67890
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Bcrypt
BCRYPT_SALT_ROUNDS=12

# Logging
LOG_LEVEL=info
```

**중요**:
- `YOUR_PASSWORD`를 실제 PostgreSQL 비밀번호로 변경
- JWT 시크릿 키를 랜덤한 문자열로 변경 (보안 강화)

---

## 3️⃣ 프로젝트 설정

### 3-1. 의존성 설치

프로젝트 루트 폴더에서 다음 명령어를 실행하세요:

```bash
cd G:\ai_coding\hellgater
npm install
```

이 명령어는 클라이언트와 서버의 모든 패키지를 설치합니다 (약 1-2분 소요).

### 3-2. Prisma 클라이언트 생성

데이터베이스 스키마를 기반으로 Prisma 클라이언트를 생성합니다:

```bash
cd server
npx prisma generate
```

### 3-3. 데이터베이스 마이그레이션

데이터베이스에 테이블을 생성합니다:

```bash
npx prisma migrate dev --name init
```

이 명령어는 다음을 수행합니다:
- 25개의 테이블 생성 (users, characters, exercises, workout_records 등)
- 초기 마이그레이션 파일 생성
- Prisma 클라이언트 재생성

**성공 메시지**:
```
Your database is now in sync with your schema.
✔ Generated Prisma Client
```

---

## 4️⃣ 애플리케이션 실행

### 4-1. 개발 서버 시작

프로젝트 루트에서 다음 명령어를 실행하세요:

```bash
cd G:\ai_coding\hellgater
npm run dev
```

이 명령어는 동시에 다음을 실행합니다:
- **프론트엔드 (Vite)**: http://localhost:3000 (또는 3001)
- **백엔드 (Express)**: http://localhost:4000

### 4-2. 성공 메시지 확인

다음과 같은 메시지가 표시되면 성공입니다:

```
[0] VITE v5.4.21  ready in 244 ms
[0] ➜  Local:   http://localhost:3000/
[1] 🚀 Server running on port 4000
[1] 📚 Environment: development
```

---

## 5️⃣ 애플리케이션 사용

### 5-1. 브라우저에서 접속

웹 브라우저를 열고 다음 주소로 접속하세요:

```
http://localhost:3000
```

또는 터미널에 표시된 포트 번호를 사용하세요 (3000이 사용 중이면 3001).

### 5-2. 회원가입 및 로그인

1. **회원가입 페이지** 접속
   - 이메일, 사용자 이름, 비밀번호 입력
   - 비밀번호 규칙: 최소 8자, 대문자, 소문자, 숫자 포함

2. **캐릭터 생성**
   - Step 1: 직업 선택 (전사, 마법사, 도적)
   - Step 2: 피부색 선택
   - "영웅 탄생!" 클릭

3. **홈 화면 확인**
   - 캐릭터 정보 (레벨, 등급, 스탯)
   - 7가지 신체 부위 레벨
   - 빠른 액션 버튼

---

## 🛠️ 문제 해결

### PostgreSQL 연결 오류

```
Error: P1001: Can't reach database server
```

**해결 방법**:
1. PostgreSQL 서비스가 실행 중인지 확인
2. `.env` 파일의 `DATABASE_URL` 확인
3. 비밀번호, 포트 번호(기본 5432) 확인

### 포트 충돌 오류

```
Port 3000 is already in use
```

**해결 방법**:
- Vite는 자동으로 다른 포트(3001)를 사용합니다
- 터미널에 표시된 포트 번호로 접속하세요

### Prisma 클라이언트 오류

```
Error: @prisma/client did not initialize yet
```

**해결 방법**:
```bash
cd server
npx prisma generate
```

### 마이그레이션 오류

```
Error: P3009: migrate found failed migrations
```

**해결 방법**:
```bash
cd server
npx prisma migrate reset  # ⚠️ 데이터베이스 초기화됨
npx prisma migrate dev --name init
```

---

## 📂 프로젝트 구조

```
hellgater/
├── client/              # 프론트엔드 (React + Vite)
│   ├── src/
│   │   ├── pages/      # Login, Register, Home, CharacterCreate
│   │   ├── components/ # Button, Input, Card, Logo
│   │   ├── hooks/      # useAuth, useCharacter
│   │   └── services/   # API 통신
│   └── package.json
├── server/              # 백엔드 (Node.js + Express)
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── utils/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env            # ⚠️ 환경 변수 파일
│   └── package.json
├── shared/              # 공유 타입
└── package.json         # 루트 설정
```

---

## 🎮 다음 단계

애플리케이션이 성공적으로 실행되었다면:

1. ✅ 회원가입 → 로그인 → 캐릭터 생성 플로우 테스트
2. ✅ 홈 화면에서 캐릭터 정보 확인
3. ✅ 브라우저 개발자 도구(F12)에서 API 통신 확인

### 개발 시 유용한 명령어

```bash
# 프론트엔드만 실행
npm run dev:client

# 백엔드만 실행
npm run dev:server

# 데이터베이스 스키마 확인
cd server
npx prisma studio  # http://localhost:5555에서 GUI 제공

# 타입 체크
npm run type-check

# 코드 포맷팅
npm run format
```

---

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. **로그 확인**: 터미널에 표시되는 에러 메시지
2. **브라우저 콘솔**: F12 → Console 탭
3. **네트워크 탭**: F12 → Network 탭 (API 요청/응답 확인)

---

## 🎉 축하합니다!

헬게이터 애플리케이션이 성공적으로 실행되었습니다! 이제 운동을 RPG처럼 즐기세요! 💪⚔️
