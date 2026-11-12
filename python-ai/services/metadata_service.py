import re

class MetadataService:
    """
    Single responsibility (Rule-Based NLP in Python):
    Analyzes normalized text and computes metadata metrics (language, page_count, word_count,
    character_count, reading_time, title, headings, sections, paragraph_count, file_statistics).
    NO AI, NO Gemini.
    """

    def analyze_metadata(self, normalized_text: str, page_count_override: int = None) -> dict:
        if not normalized_text or not isinstance(normalized_text, str):
            return {
                "language": "en",
                "page_count": page_count_override or 1,
                "word_count": 0,
                "character_count": 0,
                "reading_time": "0.00 mins",
                "title": None,
                "headings": [],
                "sections": [],
                "paragraph_count": 0,
                "file_statistics": {
                    "line_count": 0,
                    "avg_word_length": 0,
                    "avg_sentence_length": 0,
                },
            }

        lines = normalized_text.split("\n")
        words = [w for w in re.split(r"\s+", normalized_text) if w]
        word_count = len(words)
        character_count = len(normalized_text)
        line_count = len(lines)

        reading_time_mins = f"{(word_count / 200.0):.2f}"
        reading_time = f"{reading_time_mins} mins"

        title = None
        headings = []
        sections = []

        for line in lines:
            trimmed = line.strip()
            if not trimmed:
                continue

            if re.match(r"^#{1,6}\s+", trimmed):
                heading_text = re.sub(r"^#{1,6}\s+", "", trimmed).strip()
                headings.append(heading_text)
                if not title and re.match(r"^#\s+", trimmed):
                    title = heading_text

            elif re.match(r"^\d+(\.\d+)*\s+[A-Z]", trimmed):
                headings.append(trimmed)
                section_name = re.sub(r"^\d+(\.\d+)*\s+", "", trimmed).strip()
                sections.append(section_name)
                if not title:
                    title = section_name

            elif not title and len(trimmed) < 80 and (trimmed.isupper() or re.match(r"^[A-Z][a-zA-Z0-9\s]{4,60}$", trimmed)):
                title = trimmed

        if headings and not sections:
            sections = [re.sub(r"^#{1,6}\s+", "", h) for h in headings]

        paragraphs = [p for p in re.split(r"\n\s*\n", normalized_text) if p.strip()]
        paragraph_count = max(1, len(paragraphs))
        page_count = page_count_override or max(1, (line_count + 44) // 45)

        total_word_chars = sum(len(w) for w in words)
        avg_word_length = round(total_word_chars / float(word_count), 2) if word_count > 0 else 0.0

        sentences = [s for s in re.split(r"[.!?]+\s+", normalized_text) if s.strip()]
        sentence_count = max(1, len(sentences))
        avg_sentence_length = round(word_count / float(sentence_count), 2)

        language = "en"
        sample = normalized_text[:500].lower()
        if re.search(r"\b(el|la|los|las|en|con|por|para|del|es|un|una)\b", sample):
            language = "es"
        elif re.search(r"\b(le|la|les|en|du|des|pour|dans|est|un|une)\b", sample):
            language = "fr"
        elif re.search(r"\b(der|die|das|in|mit|für|von|ist|ein|eine)\b", sample):
            language = "de"

        return {
            "language": language,
            "page_count": page_count,
            "word_count": word_count,
            "character_count": character_count,
            "reading_time": reading_time,
            "title": title or "Untitled Document",
            "headings": headings,
            "sections": sections,
            "paragraph_count": paragraph_count,
            "file_statistics": {
                "line_count": line_count,
                "avg_word_length": avg_word_length,
                "avg_sentence_length": avg_sentence_length,
            },
        }


metadata_service = MetadataService()
