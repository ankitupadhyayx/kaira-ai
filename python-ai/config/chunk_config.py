import os
from dotenv import load_dotenv

load_dotenv()

class ChunkConfig:
    """
    Reads Chunking and System Configurations dynamically from python-ai/.env.
    Never hardcoded.
    """

    @staticmethod
    def get_config() -> dict:
        return {
            "database_url": os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/mobiloitte_ai"),
            "chunk_size": int(os.getenv("CHUNK_SIZE", 600)),
            "chunk_overlap": int(os.getenv("CHUNK_OVERLAP", 100)),
            "batch_size": int(os.getenv("BATCH_SIZE", 50)),
            "ocr_lang": os.getenv("OCR_LANG", "en"),
            "embedding_model": os.getenv("EMBEDDING_MODEL", "text-embedding-004"),
            "vector_db": os.getenv("VECTOR_DB", "pgvector"),
            "separators": [
                "\n# ",
                "\n## ",
                "\n### ",
                "\n1. ",
                "\n2. ",
                "\n\n",
                "\n",
                "\n• ",
                "\n- ",
                ". ",
                "? ",
                "! ",
                " ",
            ],
        }
