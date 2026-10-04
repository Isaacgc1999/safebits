import { describe, expect, it, vi } from 'vitest';
import { bootstrap } from './bootstrap.js';

function createOutput(): { write: (message: string) => boolean; written: () => string } {
  const chunks: string[] = [];
  return {
    write: (message: string): boolean => {
      chunks.push(message);
      return true;
    },
    written: (): string => chunks.join(''),
  };
}

describe('bootstrap', () => {
  it('exits with code 1 and a clear message when a required variable is missing', async () => {
    const output = createOutput();
    const start = vi.fn(async () => Promise.resolve());
    const code = await bootstrap({ NODE_ENV: 'production' }, { start, errorOutput: output });
    expect(code).toBe(1);
    expect(start).not.toHaveBeenCalled();
    expect(output.written()).toContain('Fix these environment variables');
    expect(output.written()).toContain('PORT');
  });

  it('starts the server with the parsed environment', async () => {
    const output = createOutput();
    const start = vi.fn(async () => Promise.resolve());
    const code = await bootstrap({ NODE_ENV: 'test', PORT: '4000' }, { start, errorOutput: output });
    expect(code).toBe(0);
    expect(start).toHaveBeenCalledWith({ NODE_ENV: 'test', HOST: '0.0.0.0', PORT: 4000, LOG_LEVEL: 'info' });
    expect(output.written()).toBe('');
  });

  it('exits with code 1 when the server fails to start', async () => {
    const output = createOutput();
    const start = vi.fn(async () => Promise.reject(new Error('port in use')));
    const code = await bootstrap({ NODE_ENV: 'test', PORT: '4000' }, { start, errorOutput: output });
    expect(code).toBe(1);
    expect(output.written()).toContain('port in use');
  });
});
