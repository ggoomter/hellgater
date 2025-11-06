# Windows 배치 파일 한글 인코딩 설정

## 문제
Windows 명령 프롬프트(cmd)에서 배치 파일(.bat) 실행 시 한글이 깨지는 현상

## 원인
- Windows cmd의 기본 인코딩: CP949 (Code Page 949)
- 소스 파일 인코딩: UTF-8
- 인코딩 불일치로 한글 깨짐 발생

## 해결 방법

### 배치 파일 시작 부분에 추가
```batch
@echo off
chcp 65001 >nul
```

- `chcp 65001`: UTF-8 인코딩으로 변경
- `>nul`: "활성 코드 페이지: 65001" 메시지 숨김

## 적용 예시

### ❌ 잘못된 코드
```batch
@echo off
echo 한국 수영장 정보 API 서버 시작
```
출력: `?댁긽???ㅼ튂?댁＜?몄슂`

### ✅ 올바른 코드
```batch
@echo off
chcp 65001 >nul
echo 한국 수영장 정보 API 서버 시작
```
출력: `한국 수영장 정보 API 서버 시작`

## 다른 프로젝트에 적용 시

**모든 .bat 파일 첫 줄에 추가:**
```batch
@echo off
chcp 65001 >nul
```

**PowerShell 스크립트(.ps1)인 경우:**
```powershell
# UTF-8 인코딩으로 저장 (BOM 없음)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
```

## 참고사항
- 이 설정은 현재 세션에만 적용됨
- 배치 파일 실행할 때마다 자동으로 UTF-8로 변경됨
- 원래 인코딩(CP949)으로 되돌리려면: `chcp 949`
