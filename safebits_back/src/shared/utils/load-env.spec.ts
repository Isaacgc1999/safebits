import { describe, expect, it } from 'vitest';
import { EnvValidationError } from '../models/env-validation.error.js';
import { loadEnv } from './load-env.js';

function captureError(action: () => unknown): unknown {
  try {
    action();
  } catch (error: unknown) {
    return error;
  }
  return undefined;
}

describe('loadEnv', () => {
  it('parses a complete environment and applies defaults', () => {
    expect(loadEnv({ NODE_ENV: 'development', PORT: '3000' })).toEqual({
      NODE_ENV: 'development',
      HOST: '0.0.0.0',
      PORT: 3000,
      LOG_LEVEL: 'info',
    });
  });

  it('fails fast when a required variable is missing', () => {
    expect(() => loadEnv({ NODE_ENV: 'development' })).toThrow(EnvValidationError);
  });

  it('names every invalid variable', () => {
    const error = captureError(() => loadEnv({ NODE_ENV: 'nope', PORT: '70000', LOG_LEVEL: 'loud' }));
    expect(error).toBeInstanceOf(EnvValidationError);
    const problems = error instanceof EnvValidationError ? error.problems.join(' ') : '';
    expect(problems).toContain('NODE_ENV');
    expect(problems).toContain('PORT');
    expect(problems).toContain('LOG_LEVEL');
  });
});
