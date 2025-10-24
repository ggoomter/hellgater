# PDF 처리 도구 사용 가이드

큰 PDF 파일을 Claude가 읽을 수 있도록 분할하거나 압축하는 도구입니다.

## 설치

필요한 Python 패키지를 설치합니다:

```bash
pip install PyPDF2 Pillow reportlab pdf2image
```

**Windows 사용자**: pdf2image를 사용하려면 Poppler도 설치해야 합니다:
1. https://github.com/oschwartz10612/poppler-windows/releases/ 에서 최신 버전 다운로드
2. 압축 해제 후 `bin` 폴더를 PATH에 추가하거나 직접 경로 지정

## 사용 방법

### 1. 페이지 수로 분할

PDF를 지정한 페이지 수씩 나눕니다:

```bash
python pdf-processor.py input.pdf --split-pages 10
```

예시: 100페이지 PDF를 10페이지씩 나누면 → 10개 파일 생성

### 2. 파일 크기로 분할

PDF를 지정한 크기 이하로 나눕니다 (근사치):

```bash
python pdf-processor.py input.pdf --split-size 5
```

예시: 50MB PDF를 5MB씩 나누면 → 약 10개 파일 생성

### 3. 이미지 압축

PDF 내의 이미지를 압축하여 파일 크기를 줄입니다:

```bash
python pdf-processor.py input.pdf --compress --quality 50
```

`--quality` 옵션:
- 1-100 사이 값 (낮을수록 작은 파일, 낮은 품질)
- 기본값: 50
- 권장값: 30-70

### 4. 텍스트 추출

PDF에서 텍스트만 추출하여 .txt 파일로 저장:

```bash
python pdf-processor.py input.pdf --extract-text
```

이미지나 도표가 많지 않은 텍스트 중심 PDF에 유용합니다.

### 5. 여러 작업 동시 실행

```bash
python pdf-processor.py input.pdf --split-pages 20 --extract-text
```

### 6. 출력 디렉토리 지정

```bash
python pdf-processor.py input.pdf --split-pages 10 --output-dir ./split_pdfs
```

## 활용 전략

### Claude가 읽을 수 있는 최적 크기

Claude Code는 일반적으로 다음과 같은 제한이 있습니다:
- **파일 크기**: 약 10-32MB
- **토큰 수**: 약 200,000 토큰

### 권장 처리 방법

1. **텍스트 중심 PDF (논문, 문서)**
   ```bash
   python pdf-processor.py document.pdf --extract-text
   ```
   텍스트 파일이 가장 작고 Claude가 읽기 쉽습니다.

2. **이미지가 포함된 PDF**
   ```bash
   # 먼저 압축 시도
   python pdf-processor.py slides.pdf --compress --quality 40

   # 여전히 크면 분할
   python pdf-processor.py slides.pdf --split-size 8
   ```

3. **대용량 PDF (50MB 이상)**
   ```bash
   # 크기와 텍스트 추출 동시에
   python pdf-processor.py large.pdf --split-size 10 --extract-text
   ```

## 출력 파일 구조

### 페이지 분할 시
```
original.pdf
original_split/
  ├── original_part001.pdf  (페이지 1-10)
  ├── original_part002.pdf  (페이지 11-20)
  └── original_part003.pdf  (페이지 21-30)
```

### 압축 시
```
original.pdf
original_compressed.pdf
```

### 텍스트 추출 시
```
original.pdf
original_text.txt
```

## 문제 해결

### "필요한 패키지가 설치되어 있지 않습니다"
```bash
pip install PyPDF2 Pillow reportlab pdf2image
```

### "poppler를 찾을 수 없습니다" (Windows)
1. https://github.com/oschwartz10612/poppler-windows/releases/ 에서 다운로드
2. 압축 해제 후 환경변수 PATH에 `poppler/bin` 추가

### 압축해도 파일이 크게 줄지 않는 경우
- 이미 압축된 PDF이거나 텍스트 중심 PDF일 수 있습니다
- `--split-pages` 또는 `--split-size`로 분할하세요

### 텍스트 추출이 제대로 안 되는 경우
- 스캔한 PDF나 이미지 기반 PDF는 OCR이 필요합니다
- 이 경우 `--split-pages`로 분할하여 사용하세요

## 예시 시나리오

### 시나리오 1: 100페이지 기술 문서 (30MB)
```bash
# 1. 텍스트 추출 시도
python pdf-processor.py tech_doc.pdf --extract-text

# 2. 텍스트 파일 확인 후 Claude에 업로드
# tech_doc_text.txt 사용
```

### 시나리오 2: 200페이지 강의 슬라이드 (80MB)
```bash
# 1. 압축 후 분할
python pdf-processor.py slides.pdf --compress --quality 40
python pdf-processor.py slides_compressed.pdf --split-pages 20

# 2. 생성된 파일들을 순서대로 Claude에 업로드
```

### 시나리오 3: 500페이지 API 문서 (150MB)
```bash
# 1. 크기별로 분할하고 텍스트도 추출
python pdf-processor.py api_doc.pdf --split-size 8 --extract-text

# 2. 텍스트 파일이 작으면 우선 사용, 아니면 분할된 PDF 사용
```

## 팁

1. **먼저 텍스트 추출 시도**: 가장 작고 Claude가 읽기 쉽습니다
2. **압축은 이미지가 많을 때**: 도표, 스크린샷이 많은 PDF에 효과적
3. **분할은 마지막 수단**: 꼭 필요한 섹션만 Claude에 업로드하세요
4. **여러 파일로 나뉜 경우**: Claude에게 순서를 명확히 알려주세요
   - "이 파일은 3부작 중 1부입니다" 등

## 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능합니다.
