import request from 'supertest';
import { app, setupDb, teardownDb, createUser } from './helpers';

describe('Auth API', () => {
  let server: ReturnType<typeof app>;
  beforeAll(async () => {
    await setupDb();
    server = app();
  });
  afterAll(async () => {
    await teardownDb();
  });

  describe('POST /api/auth/register', () => {
    it('creates a user and returns a token', async () => {
      const res = await request(server)
        .post('/api/auth/register')
        .send({ email: 'new@test.com', password: 'password1', name: 'New User' });
      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('new@test.com');
      expect(res.body.user.password).toBeUndefined();
    });

    it('rejects invalid email', async () => {
      const res = await request(server)
        .post('/api/auth/register')
        .send({ email: 'nope', password: 'password1', name: 'X' });
      expect(res.status).toBe(400);
    });

    it('rejects short password', async () => {
      const res = await request(server)
        .post('/api/auth/register')
        .send({ email: 'a@b.com', password: 'short', name: 'X' });
      expect(res.status).toBe(400);
    });

    it('rejects duplicate email', async () => {
      await createUser({ email: 'dup@test.com' });
      const res = await request(server)
        .post('/api/auth/register')
        .send({ email: 'dup@test.com', password: 'password1', name: 'Dup' });
      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeAll(async () => {
      await createUser({ email: 'login@test.com', password: 'password1' });
    });

    it('logs in with correct credentials', async () => {
      const res = await request(server)
        .post('/api/auth/login')
        .send({ email: 'login@test.com', password: 'password1' });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it('rejects bad password', async () => {
      const res = await request(server)
        .post('/api/auth/login')
        .send({ email: 'login@test.com', password: 'wrongpass' });
      expect(res.status).toBe(401);
    });

    it('rejects unknown user', async () => {
      const res = await request(server)
        .post('/api/auth/login')
        .send({ email: 'ghost@test.com', password: 'password1' });
      expect(res.status).toBe(401);
    });

    it('validates payload', async () => {
      const res = await request(server).post('/api/auth/login').send({});
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns the current user', async () => {
      const reg = await request(server)
        .post('/api/auth/register')
        .send({ email: 'me@test.com', password: 'password1', name: 'Me' });
      const token = reg.body.token;

      const res = await request(server).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.email).toBe('me@test.com');
    });

    it('rejects without token', async () => {
      const res = await request(server).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('rejects invalid token', async () => {
      const res = await request(server).get('/api/auth/me').set('Authorization', 'Bearer not.a.token');
      expect(res.status).toBe(401);
    });
  });
});
