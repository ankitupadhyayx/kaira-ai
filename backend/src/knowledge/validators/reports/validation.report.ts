import { ValidationErrorDetail, ValidationErrorReport } from '../../schemas/shared/reusable-validators/validation-error.types';
import { ValidationSummary } from './validation.summary';

export class ValidationReportBuilder {
  private errors: ValidationErrorDetail[] = [];
  private totalFilesChecked = 0;
  private totalRecordsChecked = 0;
  private startTime = Date.now();

  public addError(err: ValidationErrorDetail): void {
    this.errors.push(err);
  }

  public addErrors(errs: ValidationErrorDetail[]): void {
    this.errors.push(...errs);
  }

  public incrementFilesChecked(count = 1): void {
    this.totalFilesChecked += count;
  }

  public incrementRecordsChecked(count = 1): void {
    this.totalRecordsChecked += count;
  }

  public buildReport(domain: string): ValidationErrorReport {
    const errorCount = this.errors.filter((e) => e.severity === 'ERROR' || e.severity === 'CRITICAL').length;
    const warningCount = this.errors.filter((e) => e.severity === 'WARNING').length;

    return {
      isValid: errorCount === 0,
      domain,
      totalRecordsChecked: this.totalRecordsChecked,
      totalErrors: errorCount,
      totalWarnings: warningCount,
      errors: this.errors,
      timestamp: new Date().toISOString(),
    };
  }

  public buildSummary(): ValidationSummary {
    const timeMs = Date.now() - this.startTime;
    const criticals = this.errors.filter((e) => e.severity === 'CRITICAL').length;
    const errors = this.errors.filter((e) => e.severity === 'ERROR').length;
    const warnings = this.errors.filter((e) => e.severity === 'WARNING').length;
    const passed = criticals === 0 && errors === 0;

    return {
      totalFilesChecked: this.totalFilesChecked,
      totalRecordsChecked: this.totalRecordsChecked,
      passed,
      warnings,
      errors,
      criticalErrors: criticals,
      validationTimeMs: timeMs,
      summary: passed
        ? `Validation PASSED cleanly (${this.totalRecordsChecked} records checked across ${this.totalFilesChecked} files in ${timeMs}ms).`
        : `Validation FAILED with ${errors} errors, ${criticals} critical errors, ${warnings} warnings in ${timeMs}ms.`,
    };
  }
}
