# 자동 PDF 처리 도구 - 간단 사용 가이드

파일을 드래그앤드롭하거나 경로만 입력하면 **자동으로** 최적의 방법으로 처리하는 도구입니다.

## 빠른 시작

### 1. 패키지 설치 (최초 1회만)

```bash
pip install PyPDF2 Pillow reportlab pdf2image
```

### 2. 바로 사용하기

```bash
# 단일 파일 처리 (가장 간단!)
python auto-pdf.py my_document.pdf

# 폴더 내 모든 PDF 처리
python auto-pdf.py ./my_pdfs

# 현재 폴더의 모든 PDF 처리
python auto-pdf.py .
```

**끝!** 더 이상의 옵션이나 설정은 필요 없습니다.

## 무엇을 자동으로 해주나요?

### ✅ 자동 파일 감지
- PDF 파일인지 자동으로 확인
- 폴더를 주면 안에 있는 모든 PDF를 자동으로 찾음
- 대소문자 구분 없이 `.pdf`, `.PDF` 모두 인식

### ✅ 자동 크기 분석
- 파일 크기 자동 측정 (MB 단위)
- 페이지 수 자동 계산
- 텍스트/이미지 비율 자동 분석

### ✅ 자동 전략 선택

프로그램이 알아서 최적의 방법을 선택합니다:

| 파일 크기 | 파일 타입 | 자동 처리 방법 |
|----------|----------|--------------|
| **10MB 이하** | 모든 타입 | 그대로 사용 (처리 안 함) |
| **10-30MB** | 텍스트 중심 | 텍스트만 추출 → `.txt` 파일 생성 |
| **10-30MB** | 이미지 중심 | 이미지 압축 (품질 40%) |
| **30-100MB** | 텍스트 중심 | 텍스트 추출 + PDF 분할 |
| **30-100MB** | 이미지 중심 | 압축 후 분할 |
| **100MB 이상** | 모든 타입 | 작은 단위로 분할 (8MB씩) |

## 실제 사용 예시

### 예시 1: 논문 PDF (20MB, 텍스트 중심)
```bash
python auto-pdf.py research_paper.pdf
```

**결과:**
```
✓ 텍스트 추출 완료: research_paper_text.txt (245KB)
```

### 예시 2: 강의 슬라이드 (80MB, 이미지 많음)
```bash
python auto-pdf.py lecture_slides.pdf
```

**결과:**
```
✓ 압축 완료: lecture_slides_compressed.pdf (35MB)
  → 압축된 파일도 큼
✓ 분할 완료: 4개 파일
  - lecture_slides_part001.pdf (10MB)
  - lecture_slides_part002.pdf (10MB)
  - lecture_slides_part003.pdf (10MB)
  - lecture_slides_part004.pdf (5MB)
```

### 예시 3: 폴더 전체 처리
```bash
python auto-pdf.py ./documents
```

**결과:**
```
📁 5개의 PDF 파일을 찾았습니다:
  - doc1.pdf (15MB)
  - doc2.pdf (45MB)
  - doc3.pdf (8MB)
  - presentation.pdf (120MB)
  - notes.pdf (3MB)

5개의 파일을 처리하시겠습니까? (y/n): y

[각 파일을 자동으로 분석하고 최적 방법으로 처리...]

전체 작업 완료!
처리된 PDF: 5개
생성된 파일: 12개
```

## 드래그앤드롭으로 사용하기 (Windows)

### 방법 1: 배치 파일 만들기

`process_pdf.bat` 파일을 만들고 다음 내용을 넣으세요:

```batch
@echo off
python auto-pdf.py %1
pause
```

이제 PDF 파일을 `process_pdf.bat`에 드래그앤드롭하면 자동으로 처리됩니다!

### 방법 2: 폴더를 드래그앤드롭

```batch
@echo off
python auto-pdf.py %1 -y
pause
```

`-y` 옵션은 확인 없이 바로 처리합니다.

## 옵션 (필요시에만)

대부분의 경우 옵션 없이 사용하면 되지만, 필요하다면:

```bash
# 출력 폴더 지정
python auto-pdf.py my_file.pdf --output ./my_output

# 확인 없이 바로 처리 (여러 파일일 때)
python auto-pdf.py ./pdfs --yes

# 또는 -y
python auto-pdf.py ./pdfs -y
```

## 출력 파일 구조

```
원본파일.pdf
processed/                          # 자동 생성되는 폴더
  ├── 원본파일_text.txt            # 텍스트 추출 결과
  ├── 원본파일_compressed.pdf      # 압축 결과
  ├── 원본파일_part001.pdf         # 분할 결과 1
  ├── 원본파일_part002.pdf         # 분할 결과 2
  └── 원본파일_part003.pdf         # 분할 결과 3
```

## Claude에 업로드하기

처리가 끝나면 `processed` 폴더를 확인하세요:

### 우선순위

1. **`_text.txt` 파일이 있으면**: 이것을 먼저 사용하세요 (가장 작고 읽기 쉬움)
2. **`_compressed.pdf` 파일이 작으면**: 이것을 사용하세요
3. **`_part001.pdf`, `_part002.pdf` 등**: 순서대로 업로드하세요

### Claude에게 말할 때

```
이 파일은 총 3부로 나뉜 문서의 1부입니다.
```

또는

```
이것은 원본 PDF에서 추출한 텍스트입니다.
이미지나 도표는 포함되어 있지 않습니다.
```

## 문제 해결

### "필요한 패키지가 설치되어 있지 않습니다"

```bash
pip install PyPDF2 Pillow reportlab pdf2image
```

### Windows에서 "poppler를 찾을 수 없습니다"

이미지 압축 기능을 사용하려면:

1. https://github.com/oschwartz10612/poppler-windows/releases/ 다운로드
2. 압축 해제 후 `bin` 폴더를 환경변수 PATH에 추가

**간단한 방법**: poppler 없이도 분할 기능은 동작합니다. 압축만 스킵됩니다.

### "처리할 PDF 파일이 없습니다"

- 파일 경로가 정확한지 확인하세요
- 파일 확장자가 `.pdf` 또는 `.PDF`인지 확인하세요

## 비교: 기존 도구 vs 자동 도구

### 기존 `pdf-processor.py`
```bash
# 뭘 해야 할지 직접 결정해야 함
python pdf-processor.py file.pdf --split-pages 10
python pdf-processor.py file.pdf --compress --quality 50
python pdf-processor.py file.pdf --extract-text
```

### 새로운 `auto-pdf.py`
```bash
# 그냥 파일만 주면 됨!
python auto-pdf.py file.pdf
```

## 고급 사용자를 위한 팁

### 처리 과정 보기

프로그램이 자동으로 다음을 출력합니다:
- 파일 크기, 페이지 수 분석
- 텍스트/이미지 비율 분석
- 선택된 처리 전략과 이유
- 처리 진행 상황
- 최종 결과 요약

### 여러 전략 시도하기

자동 전략이 마음에 안 들면 기존 `pdf-processor.py`를 사용하세요:

```bash
# 자동 도구가 압축을 선택했지만, 분할을 원할 때
python pdf-processor.py file.pdf --split-size 5

# 자동 도구가 분할했지만, 텍스트만 원할 때
python pdf-processor.py file.pdf --extract-text
```

## 완전 자동화 스크립트 (고급)

### 폴더 감시 자동 처리 (Windows)

`watch_and_process.bat`:
```batch
@echo off
:loop
echo PDF 파일을 이 폴더에 넣으면 자동으로 처리됩니다...
timeout /t 5
python auto-pdf.py . -y
goto loop
```

### 완료 알림 (Python)

프로그램 끝에 시스템 알림을 보내려면:
```bash
python auto-pdf.py file.pdf && echo 처리 완료! || echo 오류 발생!
```

## 라이선스

MIT License - 자유롭게 사용하세요!

---

**요약**: `python auto-pdf.py 파일명.pdf` 하나로 끝!
