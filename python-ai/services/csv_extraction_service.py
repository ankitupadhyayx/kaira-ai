import csv
import os

class CSVExtractionService:
    """
    Single responsibility: Extract raw text stream from CSV files.
    Handles malformed CSV files (unequal row lengths, ragged delimiters).
    """

    def extract_csv(self, file_path: str) -> dict:
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

        raw_lines = []
        is_malformed = False

        try:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                reader = csv.reader(f)
                expected_cols = None

                for row_idx, row in enumerate(reader):
                    if not row or not any(field.strip() for field in row):
                        continue

                    if expected_cols is None:
                        expected_cols = len(row)
                    elif len(row) != expected_cols:
                        is_malformed = True

                    formatted_row = " | ".join(field.strip() for field in row if field.strip())
                    raw_lines.append(formatted_row)

        except Exception as e:
            return {
                "success": False,
                "error": f"ERR_MALFORMED_CSV: Unable to parse CSV structure ({e}).",
                "raw_text": "",
                "page_count": 0,
                "character_count": 0,
                "word_count": 0,
            }

        raw_text = "\n".join(raw_lines).strip()
        character_count = len(raw_text)
        word_count = len(raw_text.split())
        page_count = max(1, len(raw_lines) // 50)

        error_msg = "ERR_MALFORMED_CSV: Ragged row count detected, extracted best-effort content." if is_malformed else None

        return {
            "success": True,
            "error": error_msg,
            "raw_text": raw_text,
            "page_count": page_count,
            "character_count": character_count,
            "word_count": word_count,
        }


csv_extraction_service = CSVExtractionService()
