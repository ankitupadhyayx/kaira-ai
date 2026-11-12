import { logger } from '../../src/shared/logging/logger.service';

describe('Logger Service Unit Tests', () => {
  it('should log info messages without error', () => {
    expect(() => logger.info('Test info message', { correlationId: 'test-123' })).not.toThrow();
  });

  it('should log error messages with error instances', () => {
    const err = new Error('Sample error');
    expect(() => logger.error('Test error message', { correlationId: 'test-123' }, err)).not.toThrow();
  });
});
