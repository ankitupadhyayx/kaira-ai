import { VersionManager } from './manager/version.manager';
import { VersionRegistry } from './manager/version.registry';
import { VersionHistory } from './manager/version.history';
import { ContentLifecycleManager } from './lifecycle/content.lifecycle';
import { AuditLogger } from './lifecycle/audit.logger';
import { RollbackManager } from './migration/rollback.manager';
import { VersionMetadata, ContentLifecycleStatus, VersionType } from './types/versioning.types';

export class VersioningEngine {
  public readonly versionManager: VersionManager;
  public readonly registry: VersionRegistry;
  public readonly history: VersionHistory;
  public readonly lifecycleManager: ContentLifecycleManager;
  public readonly auditLogger: AuditLogger;
  public readonly rollbackManager: RollbackManager;

  constructor() {
    this.versionManager = new VersionManager();
    this.registry = new VersionRegistry();
    this.history = new VersionHistory();
    this.lifecycleManager = new ContentLifecycleManager();
    this.auditLogger = new AuditLogger();
    this.rollbackManager = new RollbackManager();
  }

  public createDomainVersion(domain: string, author: string, initialVersion = '1.0.0'): VersionMetadata {
    const metadata: VersionMetadata = {
      domain,
      version: initialVersion,
      schema_version: '1.0.0',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author,
      status: 'DRAFT',
      change_log: [`Initial creation of domain "${domain}" version ${initialVersion}`],
    };

    this.registry.registerDomainVersion(metadata);
    this.history.appendHistory(metadata);
    this.auditLogger.logEvent(domain, 'DOMAIN', 'CREATE', author, `Created initial version ${initialVersion}`);

    return metadata;
  }

  public updateDomainVersion(
    domain: string,
    bumpType: VersionType,
    author: string,
    changeDescription: string,
  ): VersionMetadata {
    const current = this.registry.getDomainVersion(domain);
    if (!current) {
      return this.createDomainVersion(domain, author);
    }

    const newVersion = this.versionManager.bumpVersion(current.version, bumpType);
    const updated: VersionMetadata = {
      ...current,
      version: newVersion,
      updated_at: new Date().toISOString(),
      author,
      change_log: [...current.change_log, `[${newVersion}] ${changeDescription}`],
    };

    this.registry.registerDomainVersion(updated);
    this.history.appendHistory(updated);
    this.auditLogger.logEvent(domain, 'DOMAIN', 'UPDATE', author, changeDescription, current.version, newVersion);

    return updated;
  }

  public transitionStatus(domain: string, targetStatus: ContentLifecycleStatus, author: string, reason: string): VersionMetadata {
    const current = this.registry.getDomainVersion(domain);
    if (!current) {
      throw new Error(`[VersioningEngine] Domain "${domain}" is not registered.`);
    }

    const newStatus = this.lifecycleManager.transition(current.status, targetStatus);
    const updated: VersionMetadata = {
      ...current,
      status: newStatus,
      updated_at: new Date().toISOString(),
      change_log: [...current.change_log, `Status changed to ${newStatus}: ${reason}`],
    };

    this.registry.registerDomainVersion(updated);
    this.history.appendHistory(updated);
    this.auditLogger.logEvent(domain, 'DOMAIN', 'STATUS_CHANGE', author, reason, current.status, newStatus);

    return updated;
  }
}
