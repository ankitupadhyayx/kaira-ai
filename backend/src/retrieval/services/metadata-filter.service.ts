import { ScoredChunkCandidate, RetrievalFilterOptions } from '../types/retrieval.types';

export class MetadataFilterService {
  /**
   * Filters vector search candidates based on enterprise metadata criteria (Department, Visibility, Language, Version).
   */
  public filterCandidates(
    candidates: ScoredChunkCandidate[],
    filters?: RetrievalFilterOptions
  ): ScoredChunkCandidate[] {
    if (!candidates || candidates.length === 0) return [];
    if (!filters || Object.keys(filters).length === 0) return candidates;

    return candidates.filter((candidate) => {
      const meta = candidate.metadata || {};

      if (filters.department && meta.department) {
        if (meta.department.toLowerCase() !== filters.department.toLowerCase()) {
          return false;
        }
      }

      if (filters.visibility && meta.visibility) {
        if (meta.visibility.toLowerCase() !== filters.visibility.toLowerCase()) {
          return false;
        }
      }

      if (filters.language && meta.language) {
        if (!meta.language.toLowerCase().includes(filters.language.toLowerCase())) {
          return false;
        }
      }

      if (filters.version && meta.version) {
        if (meta.version.toLowerCase() !== filters.version.toLowerCase()) {
          return false;
        }
      }

      if (filters.documentStatus && meta.status) {
        if (meta.status.toLowerCase() !== filters.documentStatus.toLowerCase()) {
          return false;
        }
      }

      if (filters.documentType && (meta.document_type || meta.extension)) {
        const docType = (meta.document_type || meta.extension).toLowerCase();
        if (!docType.includes(filters.documentType.toLowerCase())) {
          return false;
        }
      }

      if (filters.author && (meta.author || meta.uploaded_by)) {
        const authorVal = (meta.author || meta.uploaded_by).toLowerCase();
        if (!authorVal.includes(filters.author.toLowerCase())) {
          return false;
        }
      }

      if (filters.source && meta.source) {
        if (meta.source.toLowerCase() !== filters.source.toLowerCase()) {
          return false;
        }
      }

      if (filters.documentId && candidate.document_id) {
        if (candidate.document_id !== filters.documentId) {
          return false;
        }
      }

      if (filters.minPage && candidate.page_number < filters.minPage) {
        return false;
      }

      if (filters.maxPage && candidate.page_number > filters.maxPage) {
        return false;
      }

      return true;
    });
  }
}

export const metadataFilterService = new MetadataFilterService();
