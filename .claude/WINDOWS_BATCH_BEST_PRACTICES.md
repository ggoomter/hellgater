# Windows 배치 파일(.bat) 작성 가이드

## 🎯 사용자 선호 사항 (중요!)

### 출력 스타일
- ❌ **명령어 프롬프트 표시 금지**: `G:\path>` 같은 프롬프트 보이면 안됨
- ❌ **실행 명령어 표시 금지**: `python -c "..."` 같은 명령어 자체가 보이면 안됨
- ✅ **결과만 표시**: echo로 출력한 메시지와 프로그램 실행 결과만 표시
- ❌ **불필요한 장식 금지**: `----`, `[1/3]`, `========` 같은 구분선/단계 표시 최소화
- ✅ **간결함**: 필요한 정보만 깔끔하게

### 나쁜 예 (절대 이렇게 하지 말 것)
```
========================================
한국 수영장 정보 API 서버 시작
========================================

[1/3] Python 확인 중...
Python 3.14.0

G:\ai_coding\korea_swim>python --version
Python 3.14.0

G:\ai_coding\korea_swim>echo API 문서: http://localhost:8000/docs
API 문서: http://localhost:8000/docs

----------------------------------------
```

### 좋은 예 (이렇게 해야 함)
```
한국 수영장 정보 API 서버 시작

API 문서: http://localhost:8000/docs
웹페이지: frontend\index_refactored.html

서버 실행 중... (종료: Ctrl+C)

INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## 📝 배치 파일 작성 규칙

### 1. 필수 헤더 (항상 첫 3줄)
```batch
@echo off
chcp 65001 >nul 2>&1
setlocal
```

**설명**:
- `@echo off`: 모든 명령어 에코 끄기 (명령어 자체를 출력하지 않음)
- `chcp 65001 >nul 2>&1`: UTF-8 인코딩 설정, 메시지 숨김
- `setlocal`: 환경변수 로컬화

### 2. 화면 정리
```batch
cls
```
- 이전 출력 지우고 깨끗하게 시작

### 3. 명령어 출력 숨기기
모든 명령어 뒤에 `>nul 2>&1` 추가:
```batch
python -c "import fastapi" >nul 2>&1
pip install -r requirements.txt >nul 2>&1
pause >nul
```

### 4. 에러 체크 (조용하게)
```batch
python -c "import fastapi" >nul 2>&1
if errorlevel 1 (
    echo 필수 패키지 설치 중...
    pip install -r requirements.txt >nul 2>&1
    echo 설치 완료!
)
```

### 5. 사용자에게 보여줄 메시지만 echo
```batch
echo 서버 실행 중... (종료: Ctrl+C)
```

---

## 🔧 완전한 템플릿

```batch
@echo off
chcp 65001 >nul 2>&1
setlocal

cls
echo [프로젝트명] 시작
echo.

REM 패키지 확인 (조용히)
python -c "import 필수모듈" >nul 2>&1
if errorlevel 1 (
    echo 필수 패키지 설치 중...
    pip install -r requirements.txt >nul 2>&1
    echo 설치 완료!
    echo.
)

echo 중요한 정보1: http://...
echo 중요한 정보2: ...
echo.
echo 실행 중... (종료: Ctrl+C)
echo.

REM 메인 프로그램 실행
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause >nul
```

---

## 🚨 한글 인코딩 문제 해결

### 문제
Windows cmd는 기본적으로 CP949 인코딩을 사용하므로 UTF-8 배치 파일에서 한글이 깨짐

### 해결 방법

#### 방법 1: UTF-8 BOM으로 저장 + chcp 65001 (권장)
```python
with open('run.bat', 'w', encoding='utf-8-sig') as f:
    f.write(배치파일내용)
```

배치 파일 첫 줄:
```batch
@echo off
chcp 65001 >nul 2>&1
```

#### 방법 2: CP949로 저장 (chcp 불필요)
```python
with open('run.bat', 'w', encoding='cp949') as f:
    f.write(배치파일내용)
```

**주의**: `chcp 65001`과 CP949 저장을 동시에 사용하면 충돌 발생!

### 테스트 방법
```batch
@echo off
chcp 65001 >nul 2>&1
echo 한글 테스트
pause
```

---

## ⚠️ 피해야 할 실수

### 1. bash cat/heredoc으로 배치 파일 생성 (❌)
```bash
# 이렇게 하면 인코딩 문제 발생
cat > run.bat << 'EOF'
@echo off
echo 한글
EOF
```

### 2. Python 없이 배치 파일 생성 (❌)
항상 Python을 사용해서 인코딩 지정:
```python
with open('run.bat', 'w', encoding='utf-8-sig') as f:
    f.write(content)
```

### 3. @echo off 없이 작성 (❌)
명령어 프롬프트와 실행 명령어가 모두 출력됨

### 4. >nul 2>&1 누락 (❌)
불필요한 시스템 메시지가 출력됨

---

## 📦 requirements.txt 활용

### 프로젝트에 requirements.txt가 있으면
```batch
pip install -r requirements.txt >nul 2>&1
```

### 개별 패키지 나열하지 말 것 (❌)
```batch
# 나쁜 예
pip install fastapi uvicorn sqlalchemy pydantic ...
```

### 한 줄로 처리 (✅)
```batch
# 좋은 예
pip install -r requirements.txt >nul 2>&1
```

---

## 🎯 실제 적용 예시: korea_swim 프로젝트

### 최종 run.bat
```batch
@echo off
chcp 65001 >nul 2>&1
setlocal

cls
echo 한국 수영장 정보 API 서버 시작
echo.

python -c "import fastapi" >nul 2>&1
if errorlevel 1 (
    echo 필수 패키지 설치 중...
    pip install -r requirements.txt >nul 2>&1
    echo 설치 완료!
    echo.
)

echo API 문서: http://localhost:8000/docs
echo 웹페이지: frontend\index_refactored.html
echo.
echo 서버 실행 중... (종료: Ctrl+C)
echo.

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause >nul
```

### 생성 방법
```python
content = r"""@echo off
chcp 65001 >nul 2>&1
setlocal

cls
echo 한국 수영장 정보 API 서버 시작
echo.

python -c "import fastapi" >nul 2>&1
if errorlevel 1 (
    echo 필수 패키지 설치 중...
    pip install -r requirements.txt >nul 2>&1
    echo 설치 완료!
    echo.
)

echo API 문서: http://localhost:8000/docs
echo 웹페이지: frontend\index_refactored.html
echo.
echo 서버 실행 중... (종료: Ctrl+C)
echo.

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause >nul
"""

with open('run.bat', 'w', encoding='utf-8-sig') as f:
    f.write(content)
```

---

## 🔍 디버깅 팁

### 문제: 한글이 깨짐
- `chcp 65001 >nul 2>&1` 첫 줄에 있는지 확인
- UTF-8 BOM 인코딩으로 저장되었는지 확인

### 문제: 명령어가 화면에 출력됨
- `@echo off` 첫 줄에 있는지 확인
- 각 명령어에 `>nul 2>&1` 추가

### 문제: 창이 바로 닫힘
- 마지막에 `pause >nul` 또는 `pause` 추가

### 문제: PATH에 없는 명령어
- `python -m 모듈명` 형태로 실행 (예: `python -m uvicorn`)

---

## 📚 참고: KOREAN_ENCODING.md와의 차이

- **KOREAN_ENCODING.md**: 한글 인코딩 문제 일반론
- **이 문서**: 사용자 선호도 + 실전 배치 파일 작성법

이 문서를 먼저 참고하고, 인코딩 세부사항은 KOREAN_ENCODING.md 참고
