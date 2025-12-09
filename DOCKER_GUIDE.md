# 🐳 헬게이터 Docker 실행 가이드

이 가이드는 헬게이터를 Docker를 사용하여 어느 환경에서든 쉽게 실행하는 방법을 설명합니다.

---

## 📋 목차

1. [필수 요구사항](#필수-요구사항)
2. [빠른 시작](#빠른-시작)
3. [개발 환경 실행](#개발-환경-실행)
4. [프로덕션 환경 실행](#프로덕션-환경-실행)
5. [환경 변수 설정](#환경-변수-설정)
6. [문제 해결](#문제-해결)
7. [Docker 명령어 참고](#docker-명령어-참고)

---

## 필수 요구사항

### Docker 설치

**Windows / macOS**:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 다운로드 및 설치
- 설치 후 Docker Desktop 실행

**Linux**:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose

# CentOS/RHEL
sudo yum install docker docker-compose

# Docker 서비스 시작
sudo systemctl start docker
sudo systemctl enable docker
```

### Docker 버전 확인

```bash
docker --version
docker-compose --version
```

**권장 버전**:
- Docker >= 20.10
- Docker Compose >= 2.0

---

## 빠른 시작

### 1단계: 프로젝트 클론

```bash
git clone https://github.com/yourusername/hellgater.git
cd hellgater
```

### 2단계: 환경 변수 설정 (선택사항)

```bash
# .env.example을 복사하여 .env 파일 생성
cp .env.example .env

# .env 파일을 열어서 필요한 값 수정 (기본값으로도 실행 가능)
```

### 3단계: Docker로 실행

```bash
# 개발 환경 실행
npm run docker:dev

# 또는 직접 docker-compose 사용
docker-compose up
```

### 4단계: 브라우저에서 접속

- **프론트엔드**: http://localhost:3001
- **백엔드 API**: http://localhost:4001
- **API Health Check**: http://localhost:4001/health

---

## 개발 환경 실행

### 기본 실행

```bash
# 모든 서비스 실행 (프론트엔드 + 백엔드 + 데이터베이스)
npm run docker:dev
```

이 명령어는 다음을 실행합니다:
- PostgreSQL 데이터베이스 (포트 5434)
- Node.js 백엔드 서버 (포트 4001)
- React 프론트엔드 (포트 3001)

### 백그라운드 실행

```bash
# 백그라운드에서 실행
docker-compose up -d

# 로그 확인
npm run docker:logs
# 또는
docker-compose logs -f
```

### 재빌드 후 실행

코드 변경사항이 Dockerfile에 영향을 주는 경우:

```bash
npm run docker:dev:build
```

### 특정 서비스만 실행

```bash
# 데이터베이스만 실행
docker-compose up postgres

# 백엔드만 실행 (데이터베이스 필요)
docker-compose up postgres server
```

### 중지 및 정리

```bash
# 서비스 중지 (컨테이너 유지)
docker-compose stop

# 서비스 중지 및 컨테이너 제거
npm run docker:dev:down
# 또는
docker-compose down

# 모든 데이터 삭제 (주의!)
docker-compose down -v
```

---

## 프로덕션 환경 실행

### 1단계: 환경 변수 설정

`.env` 파일을 생성하고 프로덕션 값을 설정:

```bash
# .env 파일 생성
cp .env.example .env

# 필수 환경 변수 설정
POSTGRES_PASSWORD=강력한_비밀번호_설정
JWT_ACCESS_SECRET=강력한_시크릿_키_설정
JWT_REFRESH_SECRET=강력한_리프레시_시크릿_키_설정
```

### 2단계: 프로덕션 빌드 및 실행

```bash
# 프로덕션 환경 실행 (백그라운드)
npm run docker:prod

# 재빌드 후 실행
npm run docker:prod:build
```

### 3단계: 로그 확인

```bash
# 모든 서비스 로그
docker-compose -f docker-compose.prod.yml logs -f

# 특정 서비스 로그
docker-compose -f docker-compose.prod.yml logs -f server
```

### 4단계: 중지

```bash
npm run docker:prod:down
```

---

## 환경 변수 설정

### 환경 변수 파일 (.env)

프로젝트 루트에 `.env` 파일을 생성하여 환경 변수를 설정할 수 있습니다:

```bash
# 데이터베이스 설정
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=hellgater
POSTGRES_PORT=5433

# 서버 설정
NODE_ENV=development
PORT=4001
CLIENT_URL=http://localhost:3001

# JWT 설정
JWT_ACCESS_SECRET=your-access-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# 클라이언트 설정
VITE_API_URL=http://localhost:4001/api/v1
CLIENT_PORT=3001
```

### 환경 변수 우선순위

1. `.env` 파일의 값
2. `docker-compose.yml`의 기본값
3. 시스템 환경 변수

---

## 문제 해결

### 포트 충돌

**문제**: 포트가 이미 사용 중입니다.

**해결**:
```bash
# .env 파일에서 포트 변경
PORT=4002
CLIENT_PORT=3002
POSTGRES_PORT=5435
```

### 데이터베이스 연결 실패

**문제**: 백엔드가 데이터베이스에 연결할 수 없습니다.

**해결**:
1. 데이터베이스 컨테이너가 실행 중인지 확인:
   ```bash
   docker-compose ps
   ```

2. 데이터베이스 로그 확인:
   ```bash
   docker-compose logs postgres
   ```

3. 데이터베이스 재시작:
   ```bash
   docker-compose restart postgres
   ```

### Prisma 마이그레이션 실패

**문제**: Prisma 마이그레이션이 실패합니다.

**해결**:
```bash
# 서버 컨테이너에 접속
docker-compose exec server sh

# 수동으로 마이그레이션 실행
cd /app/server
npx prisma migrate deploy
npx prisma generate
```

### 빌드 실패

**문제**: Docker 이미지 빌드가 실패합니다.

**해결**:
1. 캐시 없이 재빌드:
   ```bash
   docker-compose build --no-cache
   ```

2. Docker 이미지 정리:
   ```bash
   docker system prune -a
   ```

### 볼륨 권한 문제 (Linux)

**문제**: Linux에서 볼륨 권한 오류가 발생합니다.

**해결**:
```bash
# 현재 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER

# 로그아웃 후 다시 로그인
```

### 컨테이너가 계속 재시작됨

**문제**: 컨테이너가 시작 후 바로 종료됩니다.

**해결**:
```bash
# 로그 확인
docker-compose logs [service-name]

# 컨테이너 상태 확인
docker-compose ps
```

---

## Docker 명령어 참고

### 기본 명령어

```bash
# 서비스 시작
docker-compose up

# 백그라운드 실행
docker-compose up -d

# 특정 서비스만 시작
docker-compose up [service-name]

# 서비스 중지
docker-compose stop

# 서비스 중지 및 컨테이너 제거
docker-compose down

# 로그 확인
docker-compose logs -f [service-name]

# 서비스 상태 확인
docker-compose ps

# 서비스 재시작
docker-compose restart [service-name]
```

### 빌드 관련

```bash
# 이미지 재빌드
docker-compose build

# 캐시 없이 재빌드
docker-compose build --no-cache

# 특정 서비스만 빌드
docker-compose build [service-name]
```

### 컨테이너 접속

```bash
# 서버 컨테이너 접속
docker-compose exec server sh

# 데이터베이스 컨테이너 접속
docker-compose exec postgres psql -U postgres -d hellgater

# 클라이언트 컨테이너 접속
docker-compose exec client sh
```

### 데이터베이스 관련

```bash
# 데이터베이스 백업
docker-compose exec postgres pg_dump -U postgres hellgater > backup.sql

# 데이터베이스 복원
docker-compose exec -T postgres psql -U postgres hellgater < backup.sql

# 데이터베이스 볼륨 확인
docker volume ls
```

### 정리 명령어

```bash
# 사용하지 않는 컨테이너 제거
docker-compose down

# 사용하지 않는 이미지 제거
docker image prune

# 사용하지 않는 볼륨 제거
docker volume prune

# 모든 정리 (주의!)
docker system prune -a --volumes
```

---

## 운영 체제별 특이사항

### Windows

- **경로 구분자**: Docker Compose는 자동으로 처리합니다.
- **파일 권한**: Windows에서는 파일 권한 문제가 거의 없습니다.
- **WSL2**: WSL2를 사용하면 성능이 향상됩니다.

### macOS

- **파일 공유**: Docker Desktop의 파일 공유 설정을 확인하세요.
- **리소스**: Docker Desktop에서 메모리/CPU 할당량을 조정할 수 있습니다.

### Linux

- **권한**: `sudo` 없이 실행하려면 사용자를 `docker` 그룹에 추가하세요.
- **방화벽**: 필요한 포트가 열려있는지 확인하세요.

---

## 보안 권장사항

### 프로덕션 환경

1. **강력한 비밀번호 사용**: `.env` 파일에서 모든 비밀번호를 변경하세요.
2. **JWT 시크릿 키**: 강력하고 랜덤한 시크릿 키를 사용하세요.
3. **포트 노출 최소화**: 필요한 포트만 외부에 노출하세요.
4. **HTTPS 사용**: 프로덕션에서는 Nginx를 통해 HTTPS를 설정하세요.
5. **정기 업데이트**: Docker 이미지를 정기적으로 업데이트하세요.

---

## 추가 리소스

- [Docker 공식 문서](https://docs.docker.com/)
- [Docker Compose 공식 문서](https://docs.docker.com/compose/)
- [프로젝트 README](./README.md)
- [시작 가이드](./GETTING_STARTED.md)

---

**문제가 발생하면 이슈를 등록하거나 개발팀에 문의하세요!** 🚀
