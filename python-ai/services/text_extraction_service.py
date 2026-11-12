import os

class TextExtractionService:
    """
    Single responsibility: Extract raw text from TXT and MD files with encoding detection.
    """

    def extract_text(self, file_path: str) -> dict:
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

        raw_text = ""
        encodings = ["utf-8", "latin-1", "ascii", "cp1252"]

        for enc in encodings:
            try:
                with open(file_path, "r", encoding=enc) as f:
                    raw_text = f.read()
                break
            except (UnicodeDecodeError, Exception):
                continue

        character_count = len(raw_text)
        word_count = len(raw_text.split())
        line_count = len(raw_text.splitlines())
        page_count = max(1, line_count // 40)

        return {
            "success": True,
            "error": None,
            "raw_text": raw_text,
            "page_count": page_count,
            "character_count": character_count,
            "word_count": word_count,
        }


text_extraction_service = TextExtractionService()
