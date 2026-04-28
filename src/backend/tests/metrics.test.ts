import request from 'supertest';
import { app, setupDb, teardownDb } from './helpers';

describe('Prometheus /metrics', () => {
  let server: ReturnType<typeof app>;
  beforeAll(async () => {
    await setupDb();
    server = app();
  });
  afterAll(async () => { await teardownDb(); });

  it('exposes prometheus metrics', async () => {
    await request(server).get('/api/health');
    const res = await request(server).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/plain/);
    expect(res.text).toMatch(/ecommerce_http_requests_total/);
    expect(res.text).toMatch(/ecommerce_http_request_duration_seconds/);
  });
});
