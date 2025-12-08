# 🚀 헬게이터 빠른 시작 가이드

이 가이드는 헬게이터를 가장 빠르게 실행하는 방법을 설명합니다.

---

## ⚡ 5분 안에 시작하기

### 1단계: Docker 설치 (2분)

**Windows / macOS**:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 다운로드 및 설치
- 설치 후 Docker Desktop 실행

**Linux**:
```bash
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo systemctl start docker
```

### 2단계: 프로젝트 클론 (1분)

```bash
git clone https://github.com/yourusername/hellgater.git
cd hellgater
```

### 3단계: 실행 (1분)

```bash
npm run docker:dev
```

### 4단계: 접속 (1분)

브라우저에서 다음 주소로 접속:
- **프론트엔드**: http://localhost:8100
- **백엔드 API**: http://localhost:8200
- **Health Check**: http://localhost:8200/health
- **PostgreSQL**: localhost:8300

**✅ 자동화된 기능:**
- 데이터베이스 마이그레이션 자동 실행 (수동 명령 불필요!)
- Prisma Client 자동 생성
- 개발 환경: 마이그레이션 파일이 없으면 자동으로 db push 실행

---

## ✅ 확인 사항

### 서비스가 정상 실행 중인지 확인

```bash
# 컨테이너 상태 확인
docker-compose ps

# 예상 출력:
# NAME                  STATUS          PORTS
# hellgater-client      Up              0.0.0.0:8100->3000/tcp
# hellgater-server      Up              0.0.0.0:8200->4000/tcp
# hellgater-db          Up (healthy)    0.0.0.0:8300->5432/tcp
```

### 로그 확인

```bash
# 모든 서비스 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f server
docker-compose logs -f client
docker-compose logs -f postgres
```

---

## 🛠️ 문제 해결

### 포트가 이미 사용 중입니다

`.env` 파일을 생성하고 포트를 변경:

```bash
PORT=4002
CLIENT_PORT=3002
POSTGRES_PORT=5435
```

### 데이터베이스 연결 실패

```bash
# 데이터베이스 재시작
docker-compose restart postgres

# 로그 확인
docker-compose logs postgres
```

### 컨테이너가 계속 재시작됨

```bash
# 로그 확인
docker-compose logs [service-name]

# 컨테이너 재빌드
docker-compose build --no-cache [service-name]
docker-compose up [service-name]
```

---

## 📚 다음 단계

- [Docker 가이드](./DOCKER_GUIDE.md) - 상세한 Docker 사용법
- [시작 가이드](./GETTING_STARTED.md) - 로컬 개발 환경 설정
- [README](./README.md) - 프로젝트 전체 문서

---

**문제가 있으면 이슈를 등록하거나 개발팀에 문의하세요!** 🚀

