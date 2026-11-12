import unicodedata
import re

class NormalizationService:
    """
    Single responsibility: Performs text normalization in Python.
    Standardizes Unicode (NFKC), quotes, bullets, whitespace, line endings,
    tabs, dashes, and strips invisible zero-width characters.
    """

    def normalize_text(self, clean_text: str, lowercase: bool = False) -> str:
        if not clean_text or not isinstance(clean_text, str):
            return ""

        text = clean_text

        # 1. Strip invisible zero-width characters and soft hyphens
        text = re.sub(r"[\u200B-\u200D\uFEFF\u00AD\u2060]", "", text)

        # 2. Unicode NFKC normalization
        text = unicodedata.normalize("NFKC", text)

        # 3. Line endings normalization
        text = text.replace("\r\n", "\n").replace("\r", "\n")

        # 4. Tabs expansion to 2 spaces
        text = text.replace("\t", "  ")

        # 5. Smart quotes normalization
        text = re.sub(r"[\u201C\u201D\u201E\u201F\u2033\u2036]", '"', text)
        text = re.sub(r"[\u2018\u2019\u201A\u201B\u2032\u2035]", "'", text)

        # 6. Dashes normalization
        text = re.sub(r"[\u2013\u2014\u2015\u2212]", "-", text)

        # 7. Bullets normalization
        text = re.sub(r"^[ \t]*[•◦▪■►]\s*", "• ", text, flags=re.MULTILINE)

        # 8. Whitespace normalization per line
        lines = [re.sub(r"[ \t]+", " ", line).strip() for line in text.split("\n")]
        text = "\n".join(lines)
        text = re.sub(r"\n{3,}", "\n\n", text).strip()

        if lowercase:
            text = text.lower()

        return text


normalization_service = NormalizationService()
