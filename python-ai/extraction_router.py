import json
import os
import sys
from services.pdf_extraction_service import pdf_extraction_service
from services.docx_extraction_service import docx_extraction_service
from services.text_extraction_service import text_extraction_service
from services.csv_extraction_service import csv_extraction_service
from services.json_extraction_service import json_extraction_service
from services.ocr_service import ocr_service

class ExtractionRouter:
    """
    Central Extraction Router: Routes document file to the proper single-responsibility extraction service.
    Enforces PaddleOCR decision flow for PDF:
    PDF -> Extract Text -> Enough text? (>= 50 chars) -> YES: Skip OCR | NO: Run PaddleOCR.
    """

    def route_and_extract(self, file_path: str, original_filename: str = "") -> dict:
        if not os.path.exists(file_path):
            return {
                "success": False,
                "error": f"ERR_FILE_NOT_FOUND: File not found at path '{file_path}'",
                "raw_text": "",
                "page_count": 0,
                "character_count": 0,
                "word_count": 0,
                "ocr_used": False,
                "language_detected": "unknown",
            }

        filename = original_filename or os.path.basename(file_path)
        ext = os.path.splitext(filename)[1].lower()

        ocr_used = False
        res = {}

        if ext == ".pdf":
            pdf_res = pdf_extraction_service.extract_pdf(file_path, min_char_threshold=50)
            if not pdf_res["success"]:
                return {
                    "success": False,
                    "error": pdf_res["error"],
                    "raw_text": "",
                    "page_count": 0,
                    "character_count": 0,
                    "word_count": 0,
                    "ocr_used": False,
                    "language_detected": "unknown",
                }

            if pdf_res["needs_ocr"]:
                # Trigger PaddleOCR ONLY when extraction returns little or no text (< 50 chars)
                ocr_res = ocr_service.run_ocr(file_path)
                ocr_used = True
                raw_text = ocr_res["raw_text"] if ocr_res["raw_text"].strip() else pdf_res["raw_text"]
                res = {
                    "raw_text": raw_text,
                    "page_count": pdf_res["page_count"] or 1,
                    "character_count": len(raw_text),
                    "word_count": len(raw_text.split()),
                    "error": None,
                }
            else:
                res = {
                    "raw_text": pdf_res["raw_text"],
                    "page_count": pdf_res["page_count"],
                    "character_count": pdf_res["character_count"],
                    "word_count": pdf_res["word_count"],
                    "error": None,
                }

        elif ext == ".docx":
            res = docx_extraction_service.extract_docx(file_path)

        elif ext == ".doc":
            return {
                "success": False,
                "error": "ERR_UNSUPPORTED_LEGACY_DOC: Binary .doc format is unsupported. Please convert to modern .docx format.",
                "raw_text": "",
                "page_count": 0,
                "character_count": 0,
                "word_count": 0,
                "ocr_used": False,
                "language_detected": "unknown",
            }

        elif ext in [".txt", ".md"]:
            res = text_extraction_service.extract_text(file_path)

        elif ext == ".csv":
            res = csv_extraction_service.extract_csv(file_path)

        elif ext == ".json":
            res = json_extraction_service.extract_json(file_path)

        elif ext in [".png", ".jpg", ".jpeg", ".bmp", ".tiff"]:
            ocr_res = ocr_service.run_ocr(file_path)
            ocr_used = True
            raw_text = ocr_res["raw_text"]
            res = {
                "success": True,
                "error": None,
                "raw_text": raw_text,
                "page_count": 1,
                "character_count": len(raw_text),
                "word_count": len(raw_text.split()),
            }

        else:
            return {
                "success": False,
                "error": f"ERR_UNSUPPORTED_FORMAT: Extension '{ext}' is not supported for text extraction.",
                "raw_text": "",
                "page_count": 0,
                "character_count": 0,
                "word_count": 0,
                "ocr_used": False,
                "language_detected": "unknown",
            }

        if not res.get("success", True) and res.get("error"):
            return {
                "success": False,
                "error": res["error"],
                "raw_text": "",
                "page_count": 0,
                "character_count": 0,
                "word_count": 0,
                "ocr_used": ocr_used,
                "language_detected": "unknown",
            }

        raw_text = res.get("raw_text", "")
        language_detected = "en"

        if raw_text and len(raw_text.strip()) > 20:
            try:
                from langdetect import detect

                language_detected = detect(raw_text[:500])
            except Exception:
                language_detected = "en"

        return {
            "success": True,
            "error": res.get("error"),
            "raw_text": raw_text,
            "page_count": res.get("page_count", 1),
            "character_count": res.get("character_count", len(raw_text)),
            "word_count": res.get("word_count", len(raw_text.split())),
            "ocr_used": ocr_used,
            "language_detected": language_detected,
        }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "Usage: python extraction_router.py <file_path> [original_filename]"}))
        sys.exit(1)

    path_arg = sys.argv[1]
    name_arg = sys.argv[2] if len(sys.argv) > 2 else ""

    router = ExtractionRouter()
    output = router.route_and_extract(path_arg, name_arg)
    print(json.dumps(output))
