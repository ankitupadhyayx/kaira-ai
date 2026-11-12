import { BaseKnowledgeRecord } from '../../schemas/base/base-knowledge.schema';

export class TitleFormatter {
  public formatTitle(record: BaseKnowledgeRecord): string {
    return `# ${record.content.title}`;
  }
}
