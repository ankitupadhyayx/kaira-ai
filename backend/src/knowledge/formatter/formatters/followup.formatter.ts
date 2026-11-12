import { BaseKnowledgeRecord } from '../../schemas/base/base-knowledge.schema';

export class MetadataFormatter {
  public formatMetadata(record: BaseKnowledgeRecord, confidence: number): string {
    return `> _Knowledge ID: ${record.identity.id} | Domain: ${record.identity.domain} | Version: ${record.metadata?.version || '1.0.0'} | Confidence: ${(confidence * 100).toFixed(0)}%_`;
  }
}

export class FollowUpFormatter {
  public generateFollowUpQuestions(record: BaseKnowledgeRecord, maxCount = 3): string[] {
    const suggestions: string[] = [];

    // Generate from related topics
    for (const topic of record.relationships?.related_topics || []) {
      suggestions.push(`Would you like to know more about ${topic}?`);
      if (suggestions.length >= maxCount) break;
    }

    // Generate from related domains
    if (suggestions.length < maxCount) {
      for (const dom of record.relationships?.related_domains || []) {
        suggestions.push(`Would you like to explore our ${dom} details?`);
        if (suggestions.length >= maxCount) break;
      }
    }

    // Default dynamic suggestion from category/domain
    if (suggestions.length === 0) {
      suggestions.push(`Would you like more details regarding ${record.identity.category || record.identity.domain}?`);
    }

    return suggestions.slice(0, maxCount);
  }

  public formatFollowUps(suggestions: string[]): string {
    if (suggestions.length === 0) return '';
    return `### Suggested Follow-up Questions\n` + suggestions.map((s) => `- ${s}`).join('\n');
  }
}
