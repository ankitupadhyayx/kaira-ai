# Enterprise RAG Data Pipeline & Ingestion Architecture (`RAG_PIPELINE.md`)

## 1. End-to-End Pipeline Architecture

```text
[ Data Sources ]
  - PDF, DOCX, PPTX, XLSX, CSV, MD
  - Web Crawler, GitHub, Confluence, Notion
  - REST APIs, SQL Databases
         │
         ▼
[ Stage 1: Document Upload & Validation ]
  - SHA-256 File Hash Check (Deduplication)
  - File Size & Format Validation
         │
         ▼
[ Stage 2: Multiformat Text Extraction ]
  - PyPDF2 / pdfplumber (PDF text & tabular layout)
  - python-docx (Word document structure)
  - openpyxl / pandas (Spreadsheet data tables)
  - BeautifulSoup4 (HTML web scraping)
         │
         ▼
[ Stage 3: Text Cleaning & Normalization ]
  - Unicode NFKD normalization
  - Removal of page header/footer noise
  - Markdown table formatting
         │
         ▼
[ Stage 4: Semantic Chunking ]
  - Recursive Character Text Splitter (512 tokens max, 64 token overlap)
  - Metadata enrichment (source file, page number, section heading)
         │
         ▼
[ Stage 5: Dense Vector Embedding ]
  - HuggingFace `sentence-transformers/all-MiniLM-L6-v2` or OpenAI `text-embedding-3-small`
  - Output: 384-dimensional or 1536-dimensional dense float vectors
         │
         ▼
[ Stage 6: Vector Database Indexing ]
  - Qdrant Vector DB collection insertion
  - HNSW graph index construction & payload indexing
         │
         ▼
[ Stage 7: Hybrid Retrieval & Reranking ]
  - BM25 Sparse Search + Dense Vector Search ➔ Reciprocal Rank Fusion (RRF)
  - Cross-Encoder (`bge-reranker-base`) top-3 chunk filtering
         │
         ▼
[ Stage 8: LLM Synthesis & Citation Generator ]
  - Context Injection into Prompt Template ➔ Grounded LLM Response + Source Links
```

---

## 2. Ingestion Strategy per Document Type

| Source Type | Parsing Strategy | Table Handling | Metadata Extracted |
|---|---|---|---|
| **PDF** | `pdfplumber` for structured layout | Extracted into Markdown tables | Page #, Title, Author, Creation Date |
| **Word (.docx)** | `python-docx` section traversal | Native table grid to Markdown | Heading levels, Author, Revision |
| **Excel / CSV** | `pandas` dataframe conversion | Rows converted to key-value pairs | Sheet name, Row range, Column headers |
| **PowerPoint (.pptx)**| `python-pptx` shape extraction | Slide text boxes concatenated | Slide #, Title, Speaker notes |
| **Web / HTML** | `BeautifulSoup4` DOM extraction | HTML `<table>` to Markdown | URL, Page Title, Meta Description |
| **Markdown / Text** | Direct text ingestion | Retains native Markdown format | File path, Relative path |

---

## 3. Semantic Chunking Specification

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=512,
    chunk_overlap=64,
    length_function=len,
    separators=["\n\n", "\n", ". ", " ", ""]
)
```

#### Why Overlap (64 tokens) is Critical:
Without overlap, important contextual information spanning the boundary between two chunks (e.g. a sentence split across a chunk boundary) would lose its context and fail to match during vector search. Overlapping preserves sentence integrity.
