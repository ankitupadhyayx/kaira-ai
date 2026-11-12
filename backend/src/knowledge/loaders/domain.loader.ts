import { FileLoader, DiscoveredFile } from './file.loader';
import { ValidationOrchestrator } from '../validators/pipeline/validation.orchestrator';
import { BaseKnowledgeRecord, BaseKnowledgeSchema } from '../schemas/base/base-knowledge.schema';
import { ValidationErrorDetail } from '../schemas/shared/reusable-validators/validation-error.types';

export interface DomainLoadResult {
  domain: string;
  validRecords: BaseKnowledgeRecord[];
  skippedRecordsCount: number;
  errors: ValidationErrorDetail[];
}

export class DomainLoader {
  private readonly fileLoader: FileLoader;
  private readonly orchestrator: ValidationOrchestrator;

  constructor(fileLoader?: FileLoader, orchestrator?: ValidationOrchestrator) {
    this.fileLoader = fileLoader || new FileLoader();
    this.orchestrator = orchestrator || new ValidationOrchestrator();
  }

  public loadDomain(domain: string): DomainLoadResult {
    const files = this.fileLoader.discoverJsonFiles(domain);
    const validRecords: BaseKnowledgeRecord[] = [];
    let skippedRecordsCount = 0;
    const errors: ValidationErrorDetail[] = [];

    for (const file of files) {
      try {
        const rawJson = this.fileLoader.parseJsonFile(file.filePath);
        const rawRecords = Array.isArray(rawJson) ? rawJson : Object.keys(rawJson).length > 0 ? [rawJson] : [];

        for (const raw of rawRecords) {
          const report = this.orchestrator.validateRecord(raw, {
            domain: file.domain,
            fileName: file.fileName,
            knownIds: new Set(),
            knownSlugs: new Set(),
            knownAliases: new Map(),
            allRecordsMap: new Map(),
          });

          if (report.isValid) {
            const parsed = BaseKnowledgeSchema.safeParse(raw);
            if (parsed.success) {
              validRecords.push(parsed.data);
            } else {
              skippedRecordsCount++;
            }
          } else {
            skippedRecordsCount++;
            errors.push(...report.errors);
          }
        }
      } catch (err: any) {
        skippedRecordsCount++;
        errors.push({
          domain: file.domain,
          fileName: file.fileName,
          severity: 'CRITICAL',
          description: `Failed to load domain file: ${err.message}`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return {
      domain,
      validRecords,
      skippedRecordsCount,
      errors,
    };
  }
}
