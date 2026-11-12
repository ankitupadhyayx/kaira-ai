import { IKnowledgeValidator, ValidationContext } from '../reports/validation.summary';
import { ValidationReportBuilder } from '../reports/validation.report';
import { ValidationErrorReport } from '../../schemas/shared/reusable-validators/validation-error.types';
import { SchemaValidator, RequiredFieldValidator, DataTypeValidator, UnknownFieldValidator } from '../core';
import { DuplicateIdValidator, DuplicateSlugValidator, DuplicateAliasValidator, BrokenReferenceValidator, CircularReferenceValidator } from '../integrity';
import { VersionValidator, LanguageValidator, StatusValidator, MetadataValidator } from '../metadata';
import { KeywordValidator, AliasValidator, SearchPhraseValidator } from '../search';
import { URLValidator, EmailValidator } from '../business';

export class ValidationOrchestrator {
  private readonly validators: IKnowledgeValidator[];

  constructor(customValidators?: IKnowledgeValidator[]) {
    this.validators = customValidators || [
      new RequiredFieldValidator(),
      new SchemaValidator(),
      new DataTypeValidator(),
      new UnknownFieldValidator(),
      new DuplicateIdValidator(),
      new DuplicateSlugValidator(),
      new DuplicateAliasValidator(),
      new BrokenReferenceValidator(),
      new CircularReferenceValidator(),
      new VersionValidator(),
      new LanguageValidator(),
      new StatusValidator(),
      new MetadataValidator(),
      new KeywordValidator(),
      new AliasValidator(),
      new SearchPhraseValidator(),
      new URLValidator(),
      new EmailValidator(),
    ];
  }

  public validateRecord(record: any, context: ValidationContext): ValidationErrorReport {
    const builder = new ValidationReportBuilder();
    builder.incrementRecordsChecked(1);

    for (const validator of this.validators) {
      const errs = validator.validate(record, context);
      builder.addErrors(errs);
    }

    return builder.buildReport(context.domain);
  }

  public validateBatch(records: any[], domain: string, fileName: string): ValidationErrorReport {
    const builder = new ValidationReportBuilder();
    builder.incrementFilesChecked(1);

    const context: ValidationContext = {
      domain,
      fileName,
      knownIds: new Set<string>(),
      knownSlugs: new Set<string>(),
      knownAliases: new Map<string, string>(),
      allRecordsMap: new Map<string, any>(),
    };

    for (const r of records) {
      if (r?.identity?.id) {
        context.allRecordsMap.set(r.identity.id, r);
      }
    }

    for (const record of records) {
      builder.incrementRecordsChecked(1);
      for (const validator of this.validators) {
        const errs = validator.validate(record, context);
        builder.addErrors(errs);
      }
    }

    return builder.buildReport(domain);
  }
}
