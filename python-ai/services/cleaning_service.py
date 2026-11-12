import re

class CleaningService:
    """
    Single responsibility: Sanitizes raw text in Python.
    Strips headers, footers, page numbers, duplicate lines, broken hyphenations,
    mojibake encoding artifacts, and normalizes bullets/URLs/emails.
    """

    def clean_text(self, raw_text: str) -> str:
        if not raw_text or not isinstance(raw_text, str):
            return ""

        text = raw_text

        # 1. Fix encoding artifacts (mojibake)
        text = text.replace("â€™", "'").replace("â€“", "–").replace("â€”", "—")
        text = text.replace("â€œ", '"').replace("â€ ", '"').replace("â€", '"')

        # 2. Strip non-printable ASCII control codes
        text = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", text)

        # 3. Standardize line endings
        text = text.replace("\r\n", "\n").replace("\r", "\n")

        # 4. Strip page numbers and headers
        text = re.sub(r"^---\s*Page\s+\d+\s*(of\s+\d+)?\s*---$", "", text, flags=re.MULTILINE | re.IGNORECASE)
        text = re.sub(r"^Page\s+\d+\s*(of\s+\d+)?\s*$", "", text, flags=re.MULTILINE | re.IGNORECASE)

        # 5. Re-join hyphenated words split across line breaks
        text = re.sub(r"(\b[a-zA-Z]+)-\s*\n\s*([a-zA-Z]+\b)", r"\1\2", text)

        # 6. Fix broken paragraphs mid-sentence
        text = re.sub(r"([a-z0-9,;:]\s*)\n\s*([a-z0-9])", r"\1 \2", text, flags=re.IGNORECASE)

        # 7. Normalize bullet points
        text = re.sub(r"^[ \t]*[*•-]\s+", "• ", text, flags=re.MULTILINE)

        # 8. Normalize email address representations
        text = re.sub(r"\b([a-zA-Z0-9._%+-]+)\s*\[\s*at\s*\]\s*([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b", r"\1@\2", text, flags=re.IGNORECASE)

        # 9. Remove duplicate consecutive lines & repetitive separators
        lines = text.split("\n")
        cleaned_lines = []
        last_line = ""

        for line in lines:
            trimmed = line.strip()
            if re.match(r"^[=\-_]{4,}$", trimmed):
                if last_line != "---":
                    cleaned_lines.push("---") if hasattr(cleaned_lines, "push") else cleaned_lines.append("---")
                    last_line = "---"
                continue

            if trimmed == "" and last_line == "":
                continue

            if trimmed != "" and trimmed == last_line and len(trimmed) > 5:
                continue

            cleaned_lines.append(line.rstrip())
            last_line = trimmed

        text = "\n".join(cleaned_lines)

        # 10. Collapse multiple spaces and blank lines
        text = re.sub(r"[ \t]+", " ", text)
        text = re.sub(r"\n{3,}", "\n\n", text).strip()

        return text


cleaning_service = CleaningService()
