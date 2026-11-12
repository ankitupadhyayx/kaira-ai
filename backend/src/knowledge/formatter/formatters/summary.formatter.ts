import { BaseKnowledgeRecord } from '../../schemas/base/base-knowledge.schema';

export class SummaryFormatter {
  public formatSummary(record: BaseKnowledgeRecord): string {
    if (!record.content.short_summary) return '';
    return `_${record.content.short_summary}_`;
  }
}

export class AnswerFormatter {
  public formatAnswer(record: BaseKnowledgeRecord): string {
    return record.content.detailed_description || '';
  }
}

export class ListFormatter {
  public formatHighlights(record: BaseKnowledgeRecord): string {
    const highlights = record.content.highlights || [];
    if (highlights.length === 0) return '';
    return `### Key Information\n` + highlights.map((h) => `- ${h}`).join('\n');
  }
}

export class LinkFormatter {
  public formatReferences(record: BaseKnowledgeRecord): string {
    const refs = [
      ...(record.references?.official_references || []),
      ...(record.references?.documentation_urls || []),
      ...(record.references?.external_references || []),
    ];
    if (refs.length === 0) return '';
    return `### References & Links\n` + refs.map((ref) => `- [${ref}](${ref})`).join('\n');
  }
}
