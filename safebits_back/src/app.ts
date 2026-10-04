import Fastify, { type FastifyInstance } from 'fastify';
import { API_BASE_PATH } from '@safebits/shared';
import { healthRoutes } from './modules/health/health.routes.js';
import type { AppOptions } from './shared/interfaces/app-options.interface.js';

export function buildApp(options: AppOptions): FastifyInstance {
  const app = Fastify({ logger: { level: options.logLevel } });
  void app.register(healthRoutes, { prefix: API_BASE_PATH });
  return app;
}
