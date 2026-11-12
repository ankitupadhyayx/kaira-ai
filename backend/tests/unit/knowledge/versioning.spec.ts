import { VersioningEngine } from '../../../src/knowledge/versioning/versioning.engine';

describe('Knowledge Versioning Engine Unit Test Suite', () => {
  const engine = new VersioningEngine();

  it('should create initial domain version and record audit log', () => {
    const meta = engine.createDomainVersion('leadership', 'admin', '1.0.0');

    expect(meta.domain).toBe('leadership');
    expect(meta.version).toBe('1.0.0');
    expect(meta.status).toBe('DRAFT');

    const logs = engine.auditLogger.getLogsForDomain('leadership');
    expect(logs.length).toBe(1);
    expect(logs[0].action).toBe('CREATE');
  });

  it('should bump semver version and track history', () => {
    const updated = engine.updateDomainVersion('leadership', 'MINOR', 'admin', 'Added new leadership profile');

    expect(updated.version).toBe('1.1.0');
    const history = engine.history.getHistory('leadership');
    expect(history.length).toBe(2);
  });

  it('should support content lifecycle status transitions', () => {
    const transitioned = engine.transitionStatus('leadership', 'REVIEW', 'reviewer', 'Sent for review');
    expect(transitioned.status).toBe('REVIEW');
  });
});
