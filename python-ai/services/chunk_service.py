import math
import re
from datetime import datetime
from config.chunk_config import ChunkConfig

class ChunkService:
    """
    Single responsibility (Python implementation):
    RecursiveCharacterTextSplitter for clean normalized text.
    Tracks headings, sections, page numbers, and outputs chunk records.
    """

    def generate_chunks(self, document_id: str, normalized_text: str, override_chunk_size: int = None, override_chunk_overlap: int = None, metadata: dict = None) -> list:
        if not normalized_text or not isinstance(normalized_text, str) or not normalized_text.strip():
            return []

        config = ChunkConfig.get_config()
        chunk_size = override_chunk_size or config["chunk_size"]
        chunk_overlap = override_chunk_overlap or config["chunk_overlap"]
        separators = config["separators"]

        char_chunk_size = max(100, chunk_size * 4)
        char_overlap = max(0, chunk_overlap * 4)

        chunks = []
        start_offset = 0
        chunk_index = 0
        current_heading = metadata.get("title", "General") if metadata else "General"
        current_section = metadata.get("title", "Overview") if metadata else "Overview"

        text_length = len(normalized_text)

        while start_offset < text_length:
            end_offset = min(text_length, start_offset + char_chunk_size)

            if end_offset < text_length:
                best_break = -1
                for sep in separators:
                    idx = normalized_text.rfind(sep, start_offset, end_offset)
                    if idx > start_offset + char_chunk_size * 0.4:
                        best_break = idx + len(sep)
                        break

                if best_break != -1:
                    end_offset = best_break

            chunk_content = normalized_text[start_offset:end_offset].strip()

            heading_match = re.search(r"(?:^|\n)(#{1,6}\s+|(?:\d+\.)+\s+)([^\n]+)", chunk_content)
            if heading_match:
                current_heading = heading_match.group(2).strip()
                current_section = re.sub(r"^\d+(\.\d+)*\s+", "", current_heading)

            line_offset = len(normalized_text[:start_offset].split("\n"))
            page_number = max(1, math.ceil(line_offset / 45.0))

            if chunk_content:
                approx_token_count = math.ceil(len(chunk_content) / 4.0)
                chunks.append({
                    "chunk_id": f"chunk_{document_id}_{chunk_index}",
                    "document_id": document_id,
                    "chunk_index": chunk_index,
                    "page_number": page_number,
                    "section": current_section,
                    "heading": current_heading,
                    "content": chunk_content,
                    "metadata": {
                        "title": metadata.get("title", "Untitled Document") if metadata else "Untitled Document",
                        "department": metadata.get("department", "General Operations") if metadata else "General Operations",
                        "token_count": approx_token_count,
                        "char_count": len(chunk_content),
                        "start_offset": start_offset,
                        "end_offset": end_offset,
                    },
                    "created_at": datetime.utcnow().isoformat() + "Z",
                })
                chunk_index += 1

            start_offset = end_offset - char_overlap
            if start_offset >= text_length or end_offset >= text_length:
                break

        return chunks


chunk_service = ChunkService()
