@echo off
chcp 65001 >nul
echo ========================================
echo   헬게이터 개발 서버 시작
echo   HELLGATER Development Server
echo ========================================
echo.
echo Docker Compose로 전체 시스템을 시작합니다...
echo - PostgreSQL (포트 5432)
echo - Backend Server (포트 4000)
echo - Frontend Client (포트 3000)
echo.

REM Docker가 실행 중인지 확인
docker info >nul 2>&1
if errorlevel 1 (
    echo [오류] Docker가 실행되지 않았습니다!
    echo Docker Desktop을 먼저 실행해주세요.
    echo.
    pause
    exit /b 1
)

echo [1/3] Docker 컨테이너 시작 중...
docker-compose up -d

if errorlevel 1 (
    echo.
    echo [오류] Docker 컨테이너 시작 실패!
    echo.
    pause
    exit /b 1
)

echo.
echo [2/3] 서비스 시작 대기 중 (10초)...
timeout /t 10 /nobreak >nul

echo.
echo [3/3] 컨테이너 상태 확인...
docker-compose ps

echo.
echo ========================================
echo   서버 시작 완료!
echo ========================================
echo.
echo 접속 주소:
echo   - 프론트엔드: http://localhost:3000
echo   - 백엔드 API: http://localhost:4000
echo   - API 문서:   http://localhost:4000/api-docs (예정)
echo.
echo 로그 확인:
echo   - 전체 로그: docker-compose logs -f
echo   - 클라이언트: docker-compose logs client -f
echo   - 서버: docker-compose logs server -f
echo.
echo 중지하려면: stop-dev.bat 실행
echo.
echo 브라우저를 열려면 아무 키나 누르세요...
pause >nul

start http://localhost:3000

echo.
echo 개발 서버가 백그라운드에서 실행 중입니다.
echo 이 창을 닫아도 서버는 계속 실행됩니다.
echo.
pause
