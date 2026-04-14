from __future__ import annotations

from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET

SOURCE_DIR = Path('/home/ubuntu/upload')
OUT_DIR = Path('/home/ubuntu/yasna-interface-mockups/research/upload_lessons')
OUT_DIR.mkdir(parents=True, exist_ok=True)

NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}


def docx_to_text(path: Path) -> str:
    with ZipFile(path) as zf:
        xml_bytes = zf.read('word/document.xml')
    root = ET.fromstring(xml_bytes)
    paragraphs: list[str] = []
    for para in root.findall('.//w:p', NS):
        parts: list[str] = []
        for node in para.findall('.//w:t', NS):
            if node.text:
                parts.append(node.text)
        text = ''.join(parts).strip()
        if text:
            paragraphs.append(text)
    return '\n'.join(paragraphs)


def main() -> None:
    files = sorted(SOURCE_DIR.glob('*.docx'))
    index_lines = ['# Извлечённые тексты уроков Ясны', '']
    for file_path in files:
        text = docx_to_text(file_path)
        out_path = OUT_DIR / f'{file_path.stem}.txt'
        out_path.write_text(text + '\n', encoding='utf-8')
        index_lines.append(f'## {file_path.name}')
        preview = '\n'.join(text.splitlines()[:20])
        index_lines.append(preview)
        index_lines.append('')
    (OUT_DIR / 'index.md').write_text('\n'.join(index_lines), encoding='utf-8')


if __name__ == '__main__':
    main()
