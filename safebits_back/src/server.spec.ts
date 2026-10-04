import { describe, expect, it } from 'vitest';
import { startServer } from './server.js';

describe('startServer', () => {
  it('listens on the configured host and port', async () => {
    const app = await startServer({ NODE_ENV: 'test', HOST: '127.0.0.1', PORT: 0, LOG_LEVEL: 'silent' });
    const [address] = app.addresses();
    const response = await fetch(`http://127.0.0.1:${String(address?.port)}/api/health`);
    await app.close();
    expect(response.status).toBe(200);
  });
});
