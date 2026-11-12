import { AuditLogRecord } from '../types/versioning.types';

export class AuditLogger {
  private logs: AuditLogRecord[] = [];

  public logEvent(
    domain: string,
    recordId: string,
    action: AuditLogRecord['action'],
    changedBy: string,
    reason: string,
    previousValue?: any,
    currentValue?: any,
  ): AuditLogRecord {
    const record: AuditLogRecord = {
      auditId: `AUD_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      domain,
      recordId,
      action,
      changedBy,
      timestamp: new Date().toISOString(),
      reason,
      previousValue,
      currentValue,
    };
    this.logs.push(record);
    return record;
  }

  public getLogsForDomain(domain: string): AuditLogRecord[] {
    return this.logs.filter((l) => l.domain.toLowerCase() === domain.toLowerCase());
  }

  public getAllLogs(): readonly AuditLogRecord[] {
    return this.logs;
  }
}
