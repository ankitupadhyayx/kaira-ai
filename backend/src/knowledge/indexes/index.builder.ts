import { BaseKnowledgeRecord } from '../schemas/base/base-knowledge.schema';
import { KnowledgeIndexes, DuplicateDetectionReport } from './index.types';

export class KnowledgeIndexBuilder {
  public buildIndexes(records: BaseKnowledgeRecord[]): KnowledgeIndexes {
    const idIndex = new Map<string, BaseKnowledgeRecord>();
    const slugIndex = new Map<string, BaseKnowledgeRecord>();
    const aliasIndex = new Map<string, BaseKnowledgeRecord[]>();
    const keywordIndex = new Map<string, BaseKnowledgeRecord[]>();
    const categoryIndex = new Map<string, BaseKnowledgeRecord[]>();
    const statusIndex = new Map<string, BaseKnowledgeRecord[]>();
    const languageIndex = new Map<string, BaseKnowledgeRecord[]>();
    const tagIndex = new Map<string, BaseKnowledgeRecord[]>();
    const relationshipIndex = new Map<string, string[]>();
    const parentChildIndex = new Map<string, string[]>();

    const technologyIndex = new Map<string, BaseKnowledgeRecord[]>();
    const serviceIndex = new Map<string, BaseKnowledgeRecord[]>();
    const companyIndex = new Map<string, BaseKnowledgeRecord[]>();
    const leadershipIndex = new Map<string, BaseKnowledgeRecord[]>();
    const locationIndex = new Map<string, BaseKnowledgeRecord[]>();
    const policyIndex = new Map<string, BaseKnowledgeRecord[]>();
    const faqIndex = new Map<string, BaseKnowledgeRecord[]>();
    const supportIndex = new Map<string, BaseKnowledgeRecord[]>();

    for (const record of records) {
      if (!record || !record.identity) continue;

      const id = record.identity.id;
      const slug = record.identity.slug;
      const domain = record.identity.domain.toLowerCase();

      idIndex.set(id, record);
      slugIndex.set(slug, record);

      this.addToMapArray(categoryIndex, record.identity.category.toLowerCase(), record);
      this.addToMapArray(statusIndex, record.status, record);
      this.addToMapArray(languageIndex, record.metadata?.language || 'en', record);

      // Search vectors
      const aliases = record.search?.aliases || [];
      for (const alias of aliases) {
        this.addToMapArray(aliasIndex, alias.toLowerCase(), record);
      }

      const keywords = record.search?.keywords || [];
      for (const kw of keywords) {
        this.addToMapArray(keywordIndex, kw.toLowerCase(), record);
      }

      // Tags
      const allTags = [
        ...(record.tags?.technology_tags || []),
        ...(record.tags?.business_tags || []),
        ...(record.tags?.department_tags || []),
        ...(record.tags?.industry_tags || []),
      ];
      for (const tag of allTags) {
        this.addToMapArray(tagIndex, tag.toLowerCase(), record);
      }

      // Domain-specific bucket indexes
      if (domain === 'technologies') this.addToMapArray(technologyIndex, id, record);
      if (domain === 'services') this.addToMapArray(serviceIndex, id, record);
      if (domain === 'company') this.addToMapArray(companyIndex, id, record);
      if (domain === 'leadership') this.addToMapArray(leadershipIndex, id, record);
      if (domain === 'locations') this.addToMapArray(locationIndex, id, record);
      if (domain === 'policies') this.addToMapArray(policyIndex, id, record);
      if (domain === 'faq') this.addToMapArray(faqIndex, id, record);
      if (domain === 'support') this.addToMapArray(supportIndex, id, record);

      // Relationship graphs
      const relatedIds = record.relationships?.related_ids || [];
      relationshipIndex.set(id, relatedIds);

      const childrenIds = record.relationships?.children_ids || [];
      parentChildIndex.set(id, childrenIds);
    }

    return {
      idIndex,
      slugIndex,
      aliasIndex,
      keywordIndex,
      categoryIndex,
      statusIndex,
      languageIndex,
      tagIndex,
      relationshipIndex,
      parentChildIndex,
      technologyIndex,
      serviceIndex,
      companyIndex,
      leadershipIndex,
      locationIndex,
      policyIndex,
      faqIndex,
      supportIndex,
    };
  }

  public detectDuplicates(records: BaseKnowledgeRecord[]): DuplicateDetectionReport {
    const seenIds = new Set<string>();
    const seenSlugs = new Set<string>();
    const seenAliases = new Set<string>();

    const duplicateIds: string[] = [];
    const duplicateSlugs: string[] = [];
    const duplicateAliases: string[] = [];

    for (const record of records) {
      if (!record || !record.identity) continue;

      const id = record.identity.id;
      const slug = record.identity.slug;

      if (seenIds.has(id)) duplicateIds.push(id);
      else seenIds.add(id);

      if (seenSlugs.has(slug)) duplicateSlugs.push(slug);
      else seenSlugs.add(slug);

      for (const alias of record.search?.aliases || []) {
        const norm = alias.toLowerCase();
        if (seenAliases.has(norm)) duplicateAliases.push(alias);
        else seenAliases.add(norm);
      }
    }

    return {
      duplicateIds,
      duplicateSlugs,
      duplicateAliases,
      totalDuplicates: duplicateIds.length + duplicateSlugs.length + duplicateAliases.length,
    };
  }

  private addToMapArray(map: Map<string, BaseKnowledgeRecord[]>, key: string, record: BaseKnowledgeRecord): void {
    const list = map.get(key) || [];
    list.push(record);
    map.set(key, list);
  }
}
