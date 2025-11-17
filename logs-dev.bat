@echo off
chcp 65001 >nul
echo ========================================
echo   헬게이터 로그 보기
echo   HELLGATER Development Logs
echo ========================================
echo.
echo 어떤 로그를 보시겠습니까?
echo.
echo 1. 전체 로그 (All)
echo 2. 클라이언트 로그 (Frontend)
echo 3. 서버 로그 (Backend)
echo 4. 데이터베이스 로그 (PostgreSQL)
echo 5. 취소
echo.
choice /c 12345 /n /m "선택하세요 (1-5): "

if errorlevel 5 exit /b 0
if errorlevel 4 goto :postgres
if errorlevel 3 goto :server
if errorlevel 2 goto :client
if errorlevel 1 goto :all

:all
echo.
echo 전체 로그를 표시합니다 (Ctrl+C로 종료)...
echo.
docker-compose logs -f
goto :end

:client
echo.
echo 클라이언트 로그를 표시합니다 (Ctrl+C로 종료)...
echo.
docker-compose logs client -f
goto :end

:server
echo.
echo 서버 로그를 표시합니다 (Ctrl+C로 종료)...
echo.
docker-compose logs server -f
goto :end

:postgres
echo.
echo 데이터베이스 로그를 표시합니다 (Ctrl+C로 종료)...
echo.
docker-compose logs postgres -f
goto :end

:end
echo.
pause
