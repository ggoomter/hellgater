"""
자동 PDF 처리 도구
파일을 드래그앤드롭하거나 경로만 입력하면 자동으로 최적의 방법으로 처리합니다.

사용법:
    python auto-pdf.py <파일_또는_폴더_경로>

예시:
    python auto-pdf.py my_document.pdf
    python auto-pdf.py ./pdfs_folder
    python auto-pdf.py .  (현재 폴더의 모든 PDF 처리)
"""

import os
import sys
from pathlib import Path
from typing import List, Tuple, Optional
import argparse

try:
    from PyPDF2 import PdfReader, PdfWriter
    import PIL.Image
    from pdf2image import convert_from_path
except ImportError as e:
    print("=" * 60)
    print("필요한 패키지가 설치되어 있지 않습니다.")
    print("=" * 60)
    print("\n다음 명령어를 실행하세요:\n")
    print("pip install PyPDF2 Pillow reportlab pdf2image")
    print("\n" + "=" * 60)
    sys.exit(1)


class AutoPDFProcessor:
    """자동으로 PDF를 분석하고 최적의 방법으로 처리"""

    # 파일 크기 임계값 (MB)
    SMALL_FILE = 10      # 10MB 이하: 그대로 사용 가능
    MEDIUM_FILE = 30     # 30MB 이하: 텍스트 추출 시도
    LARGE_FILE = 100     # 100MB 이하: 압축 또는 분할
    # 100MB 이상: 무조건 분할

    def __init__(self, file_path: str, output_dir: Optional[str] = None):
        self.file_path = Path(file_path)
        self.output_dir = Path(output_dir) if output_dir else self.file_path.parent / "processed"
        self.output_dir.mkdir(exist_ok=True)

        if not self.file_path.exists():
            raise FileNotFoundError(f"파일을 찾을 수 없습니다: {file_path}")

        self.file_size_mb = self.file_path.stat().st_size / (1024 * 1024)

    def analyze(self) -> dict:
        """PDF 파일 분석"""
        print(f"\n{'='*60}")
        print(f"파일 분석 중: {self.file_path.name}")
        print(f"{'='*60}")

        try:
            reader = PdfReader(str(self.file_path))
            total_pages = len(reader.pages)

            # 첫 페이지에서 텍스트 비율 체크
            first_page_text = reader.pages[0].extract_text()
            has_text = len(first_page_text.strip()) > 100

            analysis = {
                'total_pages': total_pages,
                'file_size_mb': self.file_size_mb,
                'has_text': has_text,
                'text_length': len(first_page_text),
                'avg_page_size_mb': self.file_size_mb / total_pages if total_pages > 0 else 0
            }

            print(f"\n파일 크기: {self.file_size_mb:.2f}MB")
            print(f"총 페이지: {total_pages}")
            print(f"페이지당 평균 크기: {analysis['avg_page_size_mb']:.2f}MB")
            print(f"텍스트 포함 여부: {'예' if has_text else '아니오 (이미지 중심)'}")

            return analysis

        except Exception as e:
            print(f"오류: PDF 파일을 읽을 수 없습니다 - {e}")
            raise

    def recommend_strategy(self, analysis: dict) -> str:
        """최적의 처리 전략 추천"""
        size = self.file_size_mb
        pages = analysis['total_pages']
        has_text = analysis['has_text']

        print(f"\n{'='*60}")
        print("처리 전략 결정")
        print(f"{'='*60}")

        # 전략 결정
        if size <= self.SMALL_FILE:
            strategy = "none"
            reason = f"파일이 충분히 작습니다 ({size:.1f}MB). 그대로 사용 가능합니다."

        elif size <= self.MEDIUM_FILE:
            if has_text:
                strategy = "extract_text"
                reason = f"텍스트 중심 문서입니다. 텍스트만 추출하면 가장 효율적입니다."
            else:
                strategy = "compress"
                reason = f"이미지 중심 문서입니다. 압축을 시도합니다."

        elif size <= self.LARGE_FILE:
            if has_text:
                strategy = "extract_text_and_split"
                reason = f"큰 파일입니다 ({size:.1f}MB). 텍스트 추출과 분할을 모두 수행합니다."
            else:
                strategy = "compress_and_split"
                reason = f"큰 이미지 중심 문서입니다. 압축 후 분할합니다."

        else:  # Very large file
            strategy = "split_aggressive"
            reason = f"매우 큰 파일입니다 ({size:.1f}MB). 작은 단위로 분할합니다."

        print(f"\n권장 전략: {strategy}")
        print(f"이유: {reason}")

        return strategy

    def process(self, strategy: Optional[str] = None) -> List[Path]:
        """자동으로 PDF 처리"""
        analysis = self.analyze()

        if strategy is None:
            strategy = self.recommend_strategy(analysis)

        print(f"\n{'='*60}")
        print("처리 시작")
        print(f"{'='*60}\n")

        results = []

        try:
            if strategy == "none":
                print(f"[OK] 파일이 이미 적절한 크기입니다: {self.file_path}")
                results.append(self.file_path)

            elif strategy == "extract_text":
                results.append(self._extract_text())

            elif strategy == "compress":
                results.append(self._compress())

            elif strategy == "extract_text_and_split":
                results.append(self._extract_text())
                results.extend(self._split_by_size(10))

            elif strategy == "compress_and_split":
                compressed = self._compress()
                # 압축된 파일을 다시 분석
                compressed_processor = AutoPDFProcessor(str(compressed), str(self.output_dir))
                compressed_analysis = compressed_processor.analyze()
                if compressed_processor.file_size_mb > 15:
                    results.extend(compressed_processor._split_by_size(10))
                else:
                    results.append(compressed)

            elif strategy == "split_aggressive":
                results.extend(self._split_by_size(8))
                # 텍스트 추출도 시도
                if analysis['has_text']:
                    results.append(self._extract_text())

        except Exception as e:
            print(f"\n오류 발생: {e}")
            import traceback
            traceback.print_exc()
            return []

        print(f"\n{'='*60}")
        print("처리 완료!")
        print(f"{'='*60}")
        print(f"\n생성된 파일 ({len(results)}개):")
        for i, result in enumerate(results, 1):
            size = result.stat().st_size / (1024 * 1024)
            print(f"  {i}. {result.name} ({size:.2f}MB)")

        print(f"\n저장 위치: {self.output_dir}")

        return results

    def _extract_text(self) -> Path:
        """텍스트 추출"""
        print("[TEXT] 텍스트 추출 중...")

        output_file = self.output_dir / f"{self.file_path.stem}_text.txt"
        reader = PdfReader(str(self.file_path))

        text_content = []
        for page_num, page in enumerate(reader.pages):
            text = page.extract_text()
            text_content.append(f"{'='*60}\n페이지 {page_num + 1}\n{'='*60}\n\n{text}\n\n")

            if (page_num + 1) % 10 == 0:
                print(f"  진행: {page_num + 1}/{len(reader.pages)} 페이지")

        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(text_content))

        size_kb = output_file.stat().st_size / 1024
        print(f"[OK] 텍스트 추출 완료: {output_file.name} ({size_kb:.1f}KB)")

        return output_file

    def _compress(self, quality: int = 40) -> Path:
        """이미지 압축"""
        print(f"[COMPRESS] 이미지 압축 중 (품질: {quality}%)...")
        print("  [INFO] 시간이 걸릴 수 있습니다. 잠시만 기다려주세요...")

        output_file = self.output_dir / f"{self.file_path.stem}_compressed.pdf"

        try:
            images = convert_from_path(str(self.file_path), dpi=150)

            temp_images = []
            for i, image in enumerate(images):
                temp_path = self.output_dir / f"temp_page_{i}.jpg"
                image.save(str(temp_path), 'JPEG', quality=quality, optimize=True)
                temp_images.append(temp_path)

                if (i + 1) % 5 == 0:
                    print(f"  진행: {i + 1}/{len(images)} 페이지")

            if temp_images:
                first_image = PIL.Image.open(temp_images[0])
                first_image.save(
                    str(output_file),
                    'PDF',
                    resolution=100.0,
                    save_all=True,
                    append_images=[PIL.Image.open(img) for img in temp_images[1:]]
                )

            # 임시 파일 삭제
            for temp_file in temp_images:
                temp_file.unlink()

            original_size = self.file_size_mb
            compressed_size = output_file.stat().st_size / (1024 * 1024)
            reduction = ((original_size - compressed_size) / original_size) * 100

            print(f"[OK] 압축 완료: {output_file.name}")
            print(f"  원본: {original_size:.1f}MB -> 압축: {compressed_size:.1f}MB (감소율: {reduction:.0f}%)")

            return output_file

        except Exception as e:
            print(f"  [WARNING] 압축 실패: {e}")
            print(f"  -> 분할 방식으로 진행합니다.")
            return self.file_path

    def _split_by_size(self, max_size_mb: float) -> List[Path]:
        """크기별로 PDF 분할"""
        print(f"[SPLIT] PDF 분할 중 (목표 크기: {max_size_mb}MB)...")

        reader = PdfReader(str(self.file_path))
        total_pages = len(reader.pages)

        # 페이지 수 계산
        avg_page_size = self.file_size_mb / total_pages
        pages_per_file = max(1, int(max_size_mb / avg_page_size))

        print(f"  파일당 약 {pages_per_file} 페이지로 분할")

        output_files = []
        file_count = 0

        for start_page in range(0, total_pages, pages_per_file):
            writer = PdfWriter()
            end_page = min(start_page + pages_per_file, total_pages)

            for page_num in range(start_page, end_page):
                writer.add_page(reader.pages[page_num])

            file_count += 1
            output_file = self.output_dir / f"{self.file_path.stem}_part{file_count:03d}.pdf"

            with open(output_file, 'wb') as f:
                writer.write(f)

            size = output_file.stat().st_size / (1024 * 1024)
            output_files.append(output_file)
            print(f"  생성: {output_file.name} (페이지 {start_page+1}-{end_page}, {size:.1f}MB)")

        print(f"[OK] 분할 완료: {len(output_files)}개 파일")

        return output_files


def find_pdf_files(path: Path) -> List[Path]:
    """경로에서 PDF 파일 찾기"""
    if path.is_file():
        # 확장자 체크 (대소문자 무시)
        if path.suffix.lower() == '.pdf':
            return [path]
        else:
            print(f"[WARNING] PDF 파일이 아닙니다: {path.name}")
            return []

    elif path.is_dir():
        # 폴더 내 모든 PDF 찾기
        pdf_files = list(path.glob("*.pdf")) + list(path.glob("*.PDF"))
        if pdf_files:
            print(f"\n[INFO] {len(pdf_files)}개의 PDF 파일을 찾았습니다:")
            for pdf in pdf_files:
                size_mb = pdf.stat().st_size / (1024 * 1024)
                print(f"  - {pdf.name} ({size_mb:.1f}MB)")
            return pdf_files
        else:
            print(f"[WARNING] PDF 파일을 찾을 수 없습니다: {path}")
            return []

    else:
        print(f"[WARNING] 유효하지 않은 경로입니다: {path}")
        return []


def main():
    print("=" * 60)
    print("           자동 PDF 처리 도구 v2.0")
    print("   파일을 자동으로 분석하여 Claude가 읽을 수 있게 처리")
    print("=" * 60)

    parser = argparse.ArgumentParser(
        description='PDF 파일을 자동으로 분석하고 처리합니다.',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
사용 예시:
  python auto-pdf.py document.pdf          # 단일 파일 처리
  python auto-pdf.py ./pdfs                # 폴더 내 모든 PDF 처리
  python auto-pdf.py .                     # 현재 폴더의 모든 PDF 처리
  python auto-pdf.py file.pdf --output ./output  # 출력 폴더 지정
        """
    )

    parser.add_argument('path', nargs='?', default='.',
                        help='PDF 파일 또는 폴더 경로 (기본값: 현재 폴더)')
    parser.add_argument('--output', type=str,
                        help='출력 폴더 지정 (기본값: ./processed)')
    parser.add_argument('--yes', '-y', action='store_true',
                        help='모든 확인 질문에 자동으로 예')

    args = parser.parse_args()

    # PDF 파일 찾기
    input_path = Path(args.path)
    pdf_files = find_pdf_files(input_path)

    if not pdf_files:
        print("\n처리할 PDF 파일이 없습니다.")
        sys.exit(0)

    # 사용자 확인
    if not args.yes and len(pdf_files) > 1:
        response = input(f"\n{len(pdf_files)}개의 파일을 처리하시겠습니까? (y/n): ")
        if response.lower() not in ['y', 'yes', '예']:
            print("취소되었습니다.")
            sys.exit(0)

    # 각 파일 처리
    total_results = []
    for i, pdf_file in enumerate(pdf_files, 1):
        if len(pdf_files) > 1:
            print(f"\n\n{'#'*60}")
            print(f"파일 {i}/{len(pdf_files)}")
            print(f"{'#'*60}")

        try:
            processor = AutoPDFProcessor(
                str(pdf_file),
                args.output
            )
            results = processor.process()
            total_results.extend(results)

        except Exception as e:
            print(f"\n오류 발생: {pdf_file.name}")
            print(f"  {e}")
            continue

    # 최종 요약
    print(f"\n\n{'='*60}")
    print("전체 작업 완료!")
    print(f"{'='*60}")
    print(f"처리된 PDF: {len(pdf_files)}개")
    print(f"생성된 파일: {len(total_results)}개")

    if total_results:
        output_dir = total_results[0].parent
        print(f"\n[INFO] 모든 파일이 저장된 위치:")
        print(f"   {output_dir.absolute()}")

        print(f"\n[TIP] 다음 단계:")
        print(f"   1. {output_dir} 폴더를 확인하세요")
        print(f"   2. _text.txt 파일이 있으면 우선적으로 사용하세요 (가장 작음)")
        print(f"   3. 분할된 PDF는 순서대로 Claude에 업로드하세요")


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n작업이 취소되었습니다.")
        sys.exit(0)
    except Exception as e:
        print(f"\n\n치명적 오류: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
