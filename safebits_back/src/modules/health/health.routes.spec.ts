import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../app.js';

describe('health routes', () => {
  let app: FastifyInstance | undefined;

  afterEach(async () => {
    await app?.close();
  });

  it('answers GET /api/health with status ok', async () => {
    app = buildApp({ logLevel: 'silent' });
    const response = await app.inject({ method: 'GET', url: '/api/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });

  it('answers 404 for unknown API paths', async () => {
    app = buildApp({ logLevel: 'silent' });
    const response = await app.inject({ method: 'GET', url: '/api/does-not-exist' });
    expect(response.statusCode).toBe(404);
  });
});
