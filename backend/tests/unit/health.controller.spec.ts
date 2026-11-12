import request from 'supertest';
import { ExpressGateway } from '../../src/ingestion/gateway/express.gateway';

describe('Health Controller Unit Tests', () => {
  const gateway = new ExpressGateway();

  it('GET /health should return status UP', async () => {
    const res = await request(gateway.app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('UP');
    expect(res.body.metadata.correlationId).toBeDefined();
  });

  it('GET /health/liveness should return alive', async () => {
    const res = await request(gateway.app).get('/health/liveness');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('alive');
  });

  it('GET /health/readiness should return ready', async () => {
    const res = await request(gateway.app).get('/health/readiness');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
  });

  it('GET /non-existent-endpoint should return 404', async () => {
    const res = await request(gateway.app).get('/non-existent-endpoint');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
