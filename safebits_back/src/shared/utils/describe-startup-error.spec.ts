import { describe, expect, it } from 'vitest';
import { EnvValidationError } from '../models/env-validation.error.js';
import { describeStartupError } from './describe-startup-error.js';

describe('describeStartupError', () => {
  it('lists each invalid environment variable', () => {
    const message = describeStartupError(new EnvValidationError(['PORT: Invalid input']));
    expect(message).toBe('safebits API cannot start. Fix these environment variables:\n  - PORT: Invalid input');
  });

  it('reports other errors by message', () => {
    expect(describeStartupError(new Error('port in use'))).toBe('safebits API cannot start: port in use');
  });

  it('reports values that are not errors generically', () => {
    expect(describeStartupError('boom')).toBe('safebits API cannot start: unknown error');
  });
});
