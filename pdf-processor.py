"""
PDF 처리 도구
큰 PDF 파일을 Claude가 읽을 수 있도록 분할하거나 압축합니다.

필요한 패키지:
pip install PyPDF2 Pillow reportlab pdf2image
"""

import os
import sys
from pathlib import Path
from typing import List, Optional
import argparse

try:
    from PyPDF2 import PdfReader, PdfWriter
    import PIL.Image
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    from pdf2image import convert_from_path
except ImportError as e:
    print(f"필요한 패키지가 설치되어 있지 않습니다: {e}")
    print("다음 명령어로 설치하세요:")
    print("pip install PyPDF2 Pillow reportlab pdf2image")
    sys.exit(1)


class PDFProcessor:
    """PDF 파일 처리 클래스"""

    def __init__(self, input_file: str):
        self.input_file = Path(input_file)
        if not self.input_file.exists():
            raise FileNotFoundError(f"파일을 찾을 수 없습니다: {input_file}")

        self.reader = PdfReader(str(self.input_file))
        self.total_pages = len(self.reader.pages)
        print(f"PDF 로드 완료: {self.input_file.name}")
        print(f"총 페이지 수: {self.total_pages}")

    def split_by_pages(self, pages_per_file: int = 10, output_dir: Optional[str] = None) -> List[Path]:
        """
        PDF를 여러 개의 작은 PDF로 분할

        Args:
            pages_per_file: 파일당 페이지 수
            output_dir: 출력 디렉토리 (기본값: 원본 파일 디렉토리)

        Returns:
            생성된 파일 경로 리스트
        """
        if output_dir is None:
            output_dir = self.input_file.parent / f"{self.input_file.stem}_split"
        else:
            output_dir = Path(output_dir)

        output_dir.mkdir(exist_ok=True)

        output_files = []
        file_count = 0

        for start_page in range(0, self.total_pages, pages_per_file):
            writer = PdfWriter()
            end_page = min(start_page + pages_per_file, self.total_pages)

            for page_num in range(start_page, end_page):
                writer.add_page(self.reader.pages[page_num])

            file_count += 1
            output_file = output_dir / f"{self.input_file.stem}_part{file_count:03d}.pdf"

            with open(output_file, 'wb') as f:
                writer.write(f)

            output_files.append(output_file)
            print(f"생성됨: {output_file.name} (페이지 {start_page+1}-{end_page})")

        print(f"\n총 {len(output_files)}개 파일 생성 완료")
        print(f"저장 위치: {output_dir}")
        return output_files

    def split_by_size(self, max_size_mb: float = 10, output_dir: Optional[str] = None) -> List[Path]:
        """
        PDF를 크기별로 분할 (근사치)

        Args:
            max_size_mb: 파일당 최대 크기 (MB)
            output_dir: 출력 디렉토리

        Returns:
            생성된 파일 경로 리스트
        """
        # 평균 페이지 크기 계산
        total_size_mb = self.input_file.stat().st_size / (1024 * 1024)
        avg_page_size = total_size_mb / self.total_pages
        pages_per_file = max(1, int(max_size_mb / avg_page_size))

        print(f"파일 크기: {total_size_mb:.2f}MB")
        print(f"예상 페이지 수/파일: {pages_per_file}")

        return self.split_by_pages(pages_per_file, output_dir)

    def compress_images(self, quality: int = 50, output_file: Optional[str] = None) -> Path:
        """
        PDF 내 이미지를 압축하여 파일 크기 줄이기

        Args:
            quality: 이미지 품질 (1-100, 낮을수록 작은 파일)
            output_file: 출력 파일 경로

        Returns:
            생성된 파일 경로
        """
        if output_file is None:
            output_file = self.input_file.parent / f"{self.input_file.stem}_compressed.pdf"
        else:
            output_file = Path(output_file)

        print(f"PDF를 이미지로 변환 중... (시간이 걸릴 수 있습니다)")

        # PDF를 이미지로 변환
        images = convert_from_path(str(self.input_file), dpi=150)

        # 새 PDF 생성
        temp_images = []
        for i, image in enumerate(images):
            temp_path = output_file.parent / f"temp_page_{i}.jpg"
            image.save(str(temp_path), 'JPEG', quality=quality, optimize=True)
            temp_images.append(temp_path)
            print(f"페이지 {i+1}/{len(images)} 압축 완료")

        # 이미지를 PDF로 결합
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

        original_size = self.input_file.stat().st_size / (1024 * 1024)
        compressed_size = output_file.stat().st_size / (1024 * 1024)
        reduction = ((original_size - compressed_size) / original_size) * 100

        print(f"\n압축 완료!")
        print(f"원본: {original_size:.2f}MB")
        print(f"압축: {compressed_size:.2f}MB")
        print(f"감소율: {reduction:.1f}%")
        print(f"저장 위치: {output_file}")

        return output_file

    def extract_text(self, output_file: Optional[str] = None) -> Path:
        """
        PDF에서 텍스트만 추출하여 텍스트 파일로 저장

        Args:
            output_file: 출력 파일 경로

        Returns:
            생성된 파일 경로
        """
        if output_file is None:
            output_file = self.input_file.parent / f"{self.input_file.stem}_text.txt"
        else:
            output_file = Path(output_file)

        text_content = []

        for page_num, page in enumerate(self.reader.pages):
            text = page.extract_text()
            text_content.append(f"=== 페이지 {page_num + 1} ===\n\n{text}\n\n")
            print(f"페이지 {page_num + 1}/{self.total_pages} 추출 완료")

        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(text_content))

        file_size = output_file.stat().st_size / 1024
        print(f"\n텍스트 추출 완료!")
        print(f"파일 크기: {file_size:.2f}KB")
        print(f"저장 위치: {output_file}")

        return output_file


def main():
    parser = argparse.ArgumentParser(
        description='PDF 파일을 Claude가 읽을 수 있도록 처리합니다.',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
사용 예시:
  # 10페이지씩 분할
  python pdf-processor.py input.pdf --split-pages 10

  # 5MB 이하로 분할
  python pdf-processor.py input.pdf --split-size 5

  # 이미지 압축 (품질 50%)
  python pdf-processor.py input.pdf --compress --quality 50

  # 텍스트만 추출
  python pdf-processor.py input.pdf --extract-text
        """
    )

    parser.add_argument('input_file', help='처리할 PDF 파일 경로')
    parser.add_argument('--split-pages', type=int, metavar='N',
                        help='N 페이지씩 분할')
    parser.add_argument('--split-size', type=float, metavar='MB',
                        help='MB 크기로 분할 (근사치)')
    parser.add_argument('--compress', action='store_true',
                        help='이미지 압축하여 파일 크기 줄이기')
    parser.add_argument('--quality', type=int, default=50, metavar='Q',
                        help='압축 품질 (1-100, 기본값: 50)')
    parser.add_argument('--extract-text', action='store_true',
                        help='텍스트만 추출하여 txt 파일로 저장')
    parser.add_argument('--output-dir', type=str,
                        help='출력 디렉토리 (기본값: 원본 파일 디렉토리)')

    args = parser.parse_args()

    if not any([args.split_pages, args.split_size, args.compress, args.extract_text]):
        parser.print_help()
        print("\n오류: 최소 한 가지 처리 방법을 선택해야 합니다.")
        sys.exit(1)

    try:
        processor = PDFProcessor(args.input_file)

        if args.split_pages:
            processor.split_by_pages(args.split_pages, args.output_dir)

        if args.split_size:
            processor.split_by_size(args.split_size, args.output_dir)

        if args.compress:
            processor.compress_images(args.quality)

        if args.extract_text:
            processor.extract_text()

        print("\n모든 작업이 완료되었습니다!")

    except Exception as e:
        print(f"\n오류 발생: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
