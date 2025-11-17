# 🚀 빠른 시작 가이드 (Windows)

## 📋 사전 준비

1. **Docker Desktop 설치 및 실행**
   - Docker Desktop이 실행 중이어야 합니다
   - 작업 표시줄에 Docker 아이콘이 보이면 OK

2. **Git Bash 또는 PowerShell**
   - Windows 명령 프롬프트 또는 PowerShell에서 실행

---

## 🎮 실행 방법

### 1️⃣ 개발 서버 시작

**방법 A: BAT 파일 더블클릭** (제일 쉬움!)
```
프로젝트 폴더에서 start-dev.bat 더블클릭
```

**방법 B: 명령어 실행**
```bash
# 프로젝트 루트에서
start-dev.bat

# 또는
npm run docker:dev
```

### 2️⃣ 브라우저에서 확인

서버가 시작되면 자동으로 브라우저가 열립니다:
- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:4000

---

## 🛠️ 유용한 BAT 파일들

### 📦 start-dev.bat
개발 서버를 시작합니다 (PostgreSQL + Backend + Frontend)

### 🛑 stop-dev.bat
개발 서버를 중지합니다

### 🔄 restart-dev.bat
개발 서버를 재시작합니다 (코드 변경 후)

### 📝 logs-dev.bat
서버 로그를 확인합니다
- 전체 로그
- 클라이언트 로그만
- 서버 로그만
- DB 로그만

### 🔧 rebuild-dev.bat
Docker 이미지를 재빌드합니다 (의존성 변경 후)

### 📊 status-dev.bat
현재 서버 상태를 확인합니다

---

## 🔍 문제 해결

### "Docker가 실행되지 않았습니다" 에러
→ Docker Desktop을 실행하고 1분 정도 기다린 후 다시 시도

### 포트가 이미 사용 중
→ 다른 프로그램이 3000, 4000, 5432 포트를 사용 중인지 확인
```bash
# 포트 사용 중인 프로세스 확인
netstat -ano | findstr :3000
netstat -ano | findstr :4000
netstat -ano | findstr :5432

# 프로세스 종료 (PID 확인 후)
taskkill /PID <프로세스번호> /F
```

### 컨테이너가 시작되지 않음
→ 재빌드 시도
```bash
rebuild-dev.bat
```

### 화면이 안 나옴 (HMR 문제)
→ 컨테이너 재시작 + 브라우저 강력 새로고침
```bash
restart-dev.bat
# 브라우저에서 Ctrl + Shift + R
```

### 완전 초기화
```bash
# 모든 컨테이너, 볼륨, 이미지 삭제
npm run docker:clean

# 다시 시작
start-dev.bat
```

---

## 📁 주요 파일 위치

```
hellgater/
├── client/              # 프론트엔드 (React)
│   └── src/
│       ├── components/  # UI 컴포넌트
│       ├── pages/       # 페이지
│       └── services/    # API 호출
│
├── server/              # 백엔드 (Express)
│   └── src/
│       ├── routes/      # API 라우트
│       ├── controllers/ # 컨트롤러
│       ├── services/    # 비즈니스 로직
│       │   └── rmAnalysis/  # ⭐ 방금 만든 1RM, 등급 평가
│       └── prisma/      # DB 스키마
│
└── shared/              # 공유 타입
```

---

## 🧪 테스트 시나리오

### 1. 백엔드 API 직접 테스트

**방법 A: 브라우저에서**
```
http://localhost:4000/health
```

**방법 B: cURL 명령어** (Git Bash)
```bash
# 헬스 체크
curl http://localhost:4000/health

# 회원가입 (예정)
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "username": "testuser"
  }'
```

### 2. 프론트엔드 화면 확인

1. http://localhost:3000 접속
2. F12 (개발자 도구) 열기
3. Console 탭에서 에러 확인
4. Network 탭에서 API 요청 확인

### 3. 데이터베이스 직접 확인

**Prisma Studio 실행**:
```bash
cd server
npx prisma studio
```

브라우저에서 http://localhost:5555 열림

---

## 📊 현재 구현 상태

### ✅ 완료
- [x] Docker 개발 환경
- [x] 프로젝트 구조
- [x] 1RM 계산 로직 (RMCalculator)
- [x] 등급 평가 로직 (GradeEvaluator)
- [x] 단위 테스트 (37개 통과)

### 🚧 진행 중
- [ ] 경험치 계산 로직
- [ ] 데이터베이스 스키마
- [ ] API 엔드포인트
- [ ] 프론트엔드 UI

### 📝 예정
- [ ] 회원가입/로그인
- [ ] 캐릭터 생성
- [ ] 운동 기록 화면
- [ ] 레벨업 모달

---

## 💡 개발 팁

### 코드 변경 후 반영

**프론트엔드 코드 변경**:
1. 파일 저장
2. HMR이 작동 안 하면: `restart-dev.bat`
3. 브라우저에서 Ctrl + Shift + R (강력 새로고침)

**백엔드 코드 변경**:
1. 파일 저장 (tsx watch가 자동 재시작)
2. 작동 안 하면: `docker-compose restart server`

**의존성 추가 (npm install)**:
```bash
# 컨테이너 안에서 설치해야 함!
docker-compose exec client npm install <패키지명>
docker-compose exec server npm install <패키지명>

# 그 다음 재시작
restart-dev.bat
```

### 로그 실시간 확인
```bash
# BAT 파일 실행
logs-dev.bat

# 또는 직접 명령어
docker-compose logs -f
```

---

## 🎯 다음 할 일

1. **경험치 계산 로직** 구현 (TDD)
2. **데이터베이스 스키마** 작성
3. **API 엔드포인트** 구현 (POST /workouts)
4. **프론트엔드 UI** 구현

---

## 📞 도움이 필요하면

1. `status-dev.bat` 실행해서 상태 확인
2. `logs-dev.bat` 실행해서 에러 로그 확인
3. 이슈 발생 시 로그 복사해서 질문

---

**Happy Coding! 💪🎮**
