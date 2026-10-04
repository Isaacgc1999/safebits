import type { FastifyInstance } from 'fastify';
import { buildApp } from './app.js';
import type { Env } from './shared/types/env.type.js';

export async function startServer(env: Env): Promise<FastifyInstance> {
  const app = buildApp({ logLevel: env.LOG_LEVEL });
  await app.listen({ host: env.HOST, port: env.PORT });
  return app;
}
