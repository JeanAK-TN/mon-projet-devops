import request from 'supertest';
import { app, setupDb, teardownDb } from './helpers';

describe('Health & 404', () => {
  let server: ReturnType<typeof app>;
  beforeAll(async () => {
    await setupDb();
    server = app();
  });
  afterAll(async () => {
    await teardownDb();
  });

  it('GET /api/health returns OK', async () => {
    const res = await request(server).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.timestamp).toBeDefined();
  });

  it('Unknown route returns 404', async () => {
    const res = await request(server).get('/api/nope');
    expect(res.status).toBe(404);
  });

  it('Swagger spec is exposed', async () => {
    const res = await request(server).get('/api/docs.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBeDefined();
  });
});
