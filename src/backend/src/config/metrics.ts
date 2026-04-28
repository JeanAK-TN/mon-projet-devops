import client from 'prom-client';
import type { Request, Response, NextFunction } from 'express';

export const register = new client.Registry();

client.collectDefaultMetrics({ register, prefix: 'ecommerce_' });

const httpRequestsTotal = new client.Counter({
  name: 'ecommerce_http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'] as const,
  registers: [register],
});

const httpRequestDurationSeconds = new client.Histogram({
  name: 'ecommerce_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status'] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const route = req.route?.path
      ? `${req.baseUrl || ''}${req.route.path}`
      : req.path;
    const labels = {
      method: req.method,
      route,
      status: String(res.statusCode),
    };
    httpRequestsTotal.inc(labels);
    const durationNs = Number(process.hrtime.bigint() - start);
    httpRequestDurationSeconds.observe(labels, durationNs / 1e9);
  });
  next();
}

export async function metricsHandler(_req: Request, res: Response): Promise<void> {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
}
