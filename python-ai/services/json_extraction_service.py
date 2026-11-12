import json
import os

class JSONExtractionService:
    """
    Single responsibility: Extract raw text from JSON files.
    Validates JSON syntax and formats key-value representations.
    """

    def extract_json(self, file_path: str) -> dict:
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

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except json.JSONDecodeError as e:
            return {
                "success": False,
                "error": f"ERR_INVALID_JSON: Malformed JSON syntax at line {e.lineno}, col {e.colno} ({e.msg}).",
                "raw_text": "",
                "page_count": 0,
                "character_count": 0,
                "word_count": 0,
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"ERR_INVALID_JSON: Unable to parse JSON file ({e}).",
                "raw_text": "",
                "page_count": 0,
                "character_count": 0,
                "word_count": 0,
            }

        lines = []

        def flatten_json(obj, prefix=""):
            if isinstance(obj, dict):
                for k, v in obj.items():
                    key_str = f"{prefix}.{k}" if prefix else str(k)
                    flatten_json(v, key_str)
            elif isinstance(obj, list):
                for i, elem in enumerate(obj):
                    flatten_json(elem, f"{prefix}[{i}]")
            else:
                lines.append(f"{prefix}: {obj}")

        flatten_json(data)
        raw_text = "\n".join(lines).strip()
        if not raw_text:
            raw_text = json.dumps(data, indent=2)

        character_count = len(raw_text)
        word_count = len(raw_text.split())
        page_count = max(1, len(lines) // 40)

        return {
            "success": True,
            "error": None,
            "raw_text": raw_text,
            "page_count": page_count,
            "character_count": character_count,
            "word_count": word_count,
        }


json_extraction_service = JSONExtractionService()
