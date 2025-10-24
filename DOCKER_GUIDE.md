# 🐳 Docker로 헬게이터 실행하기

Docker를 사용하면 환경에 관계없이 헬게이터를 쉽게 실행할 수 있습니다.

---

## 📋 사전 요구사항

### Docker Desktop 설치

**Windows / Mac**:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 다운로드 및 설치
- 설치 후 Docker Desktop 실행

**Linux**:
```bash
# Docker Engine 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 설치 확인

```bash
docker --version        # Docker version 24.0.0 이상
docker-compose --version # Docker Compose version v2.20.0 이상
```

---

## 🚀 빠른 시작 (개발 환경)

### 1단계: 프로젝트 클론 또는 이동

```bash
cd G:\ai_coding\hellgater
```

### 2단계: 환경 변수 설정 (선택사항)

기본 설정으로도 실행 가능하지만, 커스텀 설정을 원하면:

```bash
# Windows
copy .env.docker .env

# Linux/Mac
cp .env.docker .env
```

`.env` 파일을 열어서 필요한 값을 수정하세요.

### 3단계: Docker 컨테이너 실행

```bash
docker-compose up
```

또는 백그라운드 실행:

```bash
docker-compose up -d
```

### 4단계: 브라우저에서 접속

```
http://localhost:3000
```

**완료!** 🎉

---

## 🎯 Docker Compose 명령어

### 시작

```bash
# 포그라운드 실행 (로그 실시간 확인)
docker-compose up

# 백그라운드 실행
docker-compose up -d

# 특정 서비스만 실행
docker-compose up client
docker-compose up server
docker-compose up postgres
```

### 중지

```bash
# 컨테이너 중지
docker-compose stop

# 컨테이너 중지 및 제거
docker-compose down

# 컨테이너, 볼륨, 이미지까지 모두 제거
docker-compose down -v --rmi all
```

### 로그 확인

```bash
# 모든 서비스 로그
docker-compose logs

# 실시간 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs client
docker-compose logs server
docker-compose logs postgres
```

### 재시작

```bash
# 모든 서비스 재시작
docker-compose restart

# 특정 서비스만 재시작
docker-compose restart server
```

### 상태 확인

```bash
# 실행 중인 컨테이너 확인
docker-compose ps

# 자세한 상태 확인
docker-compose ps -a
```

---

## 🏗️ 서비스 구성

Docker Compose는 다음 3개의 서비스를 실행합니다:

### 1. PostgreSQL (데이터베이스)
- **포트**: 5432
- **컨테이너명**: hellgater-db
- **데이터 볼륨**: postgres_data (영구 저장)

### 2. Backend Server (Express)
- **포트**: 4000
- **컨테이너명**: hellgater-server
- **자동 실행**:
  - Prisma 마이그레이션
  - Prisma 클라이언트 생성
  - Node.js 서버 시작

### 3. Frontend Client (Vite)
- **포트**: 3000
- **컨테이너명**: hellgater-client
- **Hot Reload**: 코드 변경 시 자동 새로고침

---

## 🔧 데이터베이스 관리

### Prisma Studio 실행

데이터베이스를 GUI로 관리하려면:

```bash
# 서버 컨테이너에 접속
docker-compose exec server sh

# Prisma Studio 실행
npx prisma studio

# 브라우저에서 http://localhost:5555 접속
```

### 마이그레이션 수동 실행

```bash
# 서버 컨테이너에 접속
docker-compose exec server sh

# 마이그레이션 생성
npx prisma migrate dev --name migration_name

# 마이그레이션 적용
npx prisma migrate deploy

# Prisma 클라이언트 재생성
npx prisma generate
```

### 데이터베이스 초기화

```bash
# 모든 데이터 삭제 및 재생성
docker-compose exec server sh
npx prisma migrate reset
```

---

## 🛠️ 개발 팁

### 코드 변경 시 자동 반영

Docker Compose는 **볼륨 마운팅**을 사용하므로 로컬 코드 변경이 자동 반영됩니다:

```yaml
volumes:
  - ./client:/app/client  # 로컬 → 컨테이너 실시간 동기화
  - ./server:/app/server
```

파일을 수정하면:
- **Frontend**: Vite HMR로 즉시 반영
- **Backend**: tsx watch로 자동 재시작

### 컨테이너 내부 접속

```bash
# 클라이언트 컨테이너 접속
docker-compose exec client sh

# 서버 컨테이너 접속
docker-compose exec server sh

# PostgreSQL 컨테이너 접속
docker-compose exec postgres psql -U postgres -d hellgater
```

### 특정 서비스 재빌드

코드 변경 후 이미지를 재빌드하려면:

```bash
# 모든 서비스 재빌드
docker-compose up --build

# 특정 서비스만 재빌드
docker-compose up --build server
```

### 캐시 없이 완전 재빌드

```bash
docker-compose build --no-cache
docker-compose up
```

---

## 🚨 문제 해결

### 포트 충돌

```
Error: bind: address already in use
```

**해결 방법**:
1. 사용 중인 프로세스 종료
2. 또는 docker-compose.yml에서 포트 변경:

```yaml
ports:
  - "3001:3000"  # 3000 → 3001로 변경
```

### 볼륨 권한 오류

```
Error: EACCES: permission denied
```

**해결 방법**:
```bash
# Linux/Mac
sudo chown -R $USER:$USER .

# Windows (관리자 권한 PowerShell)
icacls . /grant Users:F /T
```

### 데이터베이스 연결 실패

```
Error: Can't reach database server
```

**해결 방법**:
1. PostgreSQL 컨테이너 상태 확인:
   ```bash
   docker-compose ps postgres
   ```

2. 로그 확인:
   ```bash
   docker-compose logs postgres
   ```

3. 헬스체크 대기 후 재시작:
   ```bash
   docker-compose restart server
   ```

### 이미지 빌드 실패

```
Error: failed to solve
```

**해결 방법**:
```bash
# Docker 캐시 정리
docker system prune -a

# 재빌드
docker-compose build --no-cache
docker-compose up
```

### 컨테이너가 계속 재시작

```bash
# 로그로 원인 확인
docker-compose logs -f server

# 특정 컨테이너 강제 종료
docker-compose stop server
docker-compose rm -f server
docker-compose up server
```

---

## 🌐 프로덕션 배포

### 프로덕션 빌드 실행

프로덕션용 최적화된 빌드:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

**주요 차이점**:
- 단일 컨테이너로 통합 (client + server)
- 최적화된 빌드
- Nginx 리버스 프록시 (선택사항)
- 환경 변수 보안 강화

### 환경 변수 설정

프로덕션에서는 `.env` 파일 생성 필수:

```bash
# .env 파일 생성
POSTGRES_PASSWORD=super_secure_password_here
JWT_ACCESS_SECRET=very-long-random-secret-key-at-least-32-characters
JWT_REFRESH_SECRET=another-very-long-random-secret-key-different
```

### 보안 체크리스트

- [ ] `.env` 파일 절대 Git에 커밋 금지
- [ ] JWT 시크릿 변경 (32자 이상 랜덤 문자열)
- [ ] PostgreSQL 비밀번호 변경
- [ ] HTTPS 설정 (Nginx + Let's Encrypt)
- [ ] 방화벽 설정 (필요한 포트만 개방)

---

## 📊 리소스 모니터링

### Docker Stats

```bash
# 실시간 리소스 사용량
docker stats

# 특정 컨테이너만
docker stats hellgater-client hellgater-server
```

### 디스크 사용량

```bash
# Docker 디스크 사용량
docker system df

# 자세한 정보
docker system df -v
```

### 정리

```bash
# 사용하지 않는 컨테이너 제거
docker container prune

# 사용하지 않는 이미지 제거
docker image prune -a

# 사용하지 않는 볼륨 제거
docker volume prune

# 전체 정리 (주의!)
docker system prune -a --volumes
```

---

## 🎓 추가 학습 자료

### Docker 명령어

```bash
# 이미지 목록
docker images

# 컨테이너 목록
docker ps -a

# 네트워크 목록
docker network ls

# 볼륨 목록
docker volume ls
```

### Docker Compose 파일 검증

```bash
# 문법 검증
docker-compose config

# 변수 치환 결과 확인
docker-compose config --resolve-image-digests
```

---

## 💡 자주 묻는 질문 (FAQ)

### Q1: 로컬 개발 vs Docker, 언제 뭘 사용해야 하나요?

**로컬 개발 (`npm run dev`)**:
- ✅ 빠른 개발 속도
- ✅ IDE 통합 쉬움
- ❌ 환경 설정 필요

**Docker**:
- ✅ 환경 독립적
- ✅ 팀원 간 동일 환경
- ✅ 프로덕션과 유사
- ❌ 초기 설정 시간

### Q2: Docker 컨테이너를 백그라운드에서 항상 실행하려면?

```bash
docker-compose up -d
```

시스템 부팅 시 자동 시작하려면 Docker Desktop 설정 변경.

### Q3: 데이터베이스 데이터는 어디에 저장되나요?

Docker 볼륨 `postgres_data`에 영구 저장됩니다.

```bash
# 볼륨 위치 확인
docker volume inspect hellgater_postgres_data
```

### Q4: 컨테이너 삭제 시 데이터도 삭제되나요?

```bash
docker-compose down      # 데이터 유지
docker-compose down -v   # 데이터 삭제 (주의!)
```

---

## 🎉 완료!

이제 Docker로 헬게이터를 실행할 수 있습니다!

**개발 환경 시작**:
```bash
docker-compose up
```

**프로덕션 배포**:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

**접속**:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- Prisma Studio: http://localhost:5555

---

## 📞 지원

문제가 발생하면:
1. `docker-compose logs -f` 로그 확인
2. `docker-compose ps` 상태 확인
3. `docker system df` 디스크 용량 확인
