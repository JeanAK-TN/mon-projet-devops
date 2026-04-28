import { signToken, authenticate, requireRole } from '../src/middleware/auth';
import errorHandler from '../src/middleware/errorHandler';

function mockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as any;
}

describe('auth middleware', () => {
  it('signToken produces a non-empty string', () => {
    const t = signToken({ id: 1, role: 'user' });
    expect(typeof t).toBe('string');
    expect(t.split('.')).toHaveLength(3);
  });

  it('authenticate rejects missing header', () => {
    const req: any = { headers: {} };
    const res = mockRes();
    const next = jest.fn();
    authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('authenticate rejects malformed header', () => {
    const req: any = { headers: { authorization: 'Token abc' } };
    const res = mockRes();
    const next = jest.fn();
    authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('authenticate accepts valid bearer', () => {
    const token = signToken({ id: 42, role: 'admin' });
    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();
    authenticate(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.id).toBe(42);
  });

  it('requireRole 403 when user missing', () => {
    const req: any = {};
    const res = mockRes();
    const next = jest.fn();
    requireRole('admin')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('requireRole passes when role matches', () => {
    const req: any = { user: { role: 'admin' } };
    const res = mockRes();
    const next = jest.fn();
    requireRole('admin')(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('errorHandler', () => {
  let errSpy: jest.SpyInstance;
  beforeAll(() => { errSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); });
  afterAll(() => { errSpy.mockRestore(); });

  it('handles validation errors', () => {
    const err: any = {
      name: 'SequelizeValidationError',
      errors: [{ path: 'email', message: 'invalid' }],
    };
    const res = mockRes();
    errorHandler(err, {} as any, res, () => {});
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('falls back to 500', () => {
    const res = mockRes();
    errorHandler(new Error('boom') as any, {} as any, res, () => {});
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('uses status from error', () => {
    const err: any = new Error('teapot');
    err.status = 418;
    const res = mockRes();
    errorHandler(err, {} as any, res, () => {});
    expect(res.status).toHaveBeenCalledWith(418);
  });
});
