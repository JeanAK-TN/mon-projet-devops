import request from 'supertest';
import { app, setupDb, teardownDb, createUser } from './helpers';
import { signToken } from '../src/middleware/auth';

describe('Users API (admin)', () => {
  let server: ReturnType<typeof app>;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    await setupDb();
    server = app();
    const admin = await createUser({ email: 'admin@u.com', role: 'admin' });
    const user = await createUser({ email: 'user@u.com' });
    adminToken = signToken({ id: admin.id, role: 'admin' });
    userToken = signToken({ id: user.id, role: 'user' });
  });
  afterAll(async () => { await teardownDb(); });

  it('rejects unauthenticated', async () => {
    const res = await request(server).get('/api/users');
    expect(res.status).toBe(401);
  });

  it('rejects non-admin', async () => {
    const res = await request(server).get('/api/users').set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('lists users for admin', async () => {
    const res = await request(server).get('/api/users').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body[0].password).toBeUndefined();
  });

  it('gets a single user', async () => {
    const list = await request(server).get('/api/users').set('Authorization', `Bearer ${adminToken}`);
    const id = list.body[0].id;
    const res = await request(server).get(`/api/users/${id}`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
  });

  it('404 on missing user', async () => {
    const res = await request(server).get('/api/users/99999').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});
