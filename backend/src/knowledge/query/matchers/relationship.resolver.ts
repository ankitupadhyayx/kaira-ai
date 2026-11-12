import { KnowledgeCacheService } from '../../cache/knowledge-cache.service';
import { BaseKnowledgeRecord } from '../../schemas/base/base-knowledge.schema';

export class RelationshipResolver {
  public resolveRelatedRecords(record: BaseKnowledgeRecord, cache: KnowledgeCacheService): BaseKnowledgeRecord[] {
    const related: BaseKnowledgeRecord[] = [];
    const relatedIds = record.relationships?.related_ids || [];
    const parentId = record.relationships?.parent_id;

    if (parentId) {
      const parent = cache.getRecordById(parentId);
      if (parent) related.push(parent);
    }

    for (const rId of relatedIds) {
      const relRecord = cache.getRecordById(rId);
      if (relRecord) related.push(relRecord);
    }

    return related;
  }
}
