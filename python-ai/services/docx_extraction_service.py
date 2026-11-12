import os

class DOCXExtractionService:
    """
    Single responsibility: Extract raw text from DOCX documents (paragraphs and tables).
    Detects unsupported legacy binary .doc files and empty files.
    """

    def extract_docx(self, file_path: str) -> dict:
        if not os.path.exists(file_path):
            return {
                "success": False,
                "error": f"ERR_FILE_NOT_FOUND: File not found at path '{file_path}'",
                "raw_text": "",
                "page_count": 0,
                "character_count": 0,
                "word_count": 0,
            }

        if os.path.getsize(file_path) == 0:
            return {
                "success": False,
                "error": "ERR_EMPTY_FILE: Document file is 0 bytes.",
                "raw_text": "",
                "page_count": 0,
                "character_count": 0,
                "word_count": 0,
            }

        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".doc":
            return {
                "success": False,
                "error": "ERR_UNSUPPORTED_LEGACY_DOC: Binary .doc format is unsupported. Please convert to modern .docx format.",
                "raw_text": "",
                "page_count": 0,
                "character_count": 0,
                "word_count": 0,
            }

        lines = []
        try:
            import docx

            doc = docx.Document(file_path)

            for p in doc.paragraphs:
                if p.text and p.text.strip():
                    lines.append(p.text.strip())

            for table in doc.tables:
                for row in table.rows:
                    row_cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                    if row_cells:
                        lines.append(" | ".join(row_cells))

        except Exception as e:
            return {
                "success": False,
                "error": f"ERR_CORRUPTED_DOCX: Failed to parse DOCX structure ({e}).",
                "raw_text": "",
                "page_count": 0,
                "character_count": 0,
                "word_count": 0,
            }

        raw_text = "\n\n".join(lines).strip()
        character_count = len(raw_text)
        word_count = len(raw_text.split())
        page_count = max(1, len(doc.paragraphs) // 25) if 'doc' in locals() else 1

        return {
            "success": True,
            "error": None,
            "raw_text": raw_text,
            "page_count": page_count,
            "character_count": character_count,
            "word_count": word_count,
        }


docx_extraction_service = DOCXExtractionService()
