import { EnvValidationError } from '../models/env-validation.error.js';

export function describeStartupError(error: unknown): string {
  if (error instanceof EnvValidationError) {
    return [
      'safebits API cannot start. Fix these environment variables:',
      ...error.problems.map((problem) => `  - ${problem}`),
    ].join('\n');
  }
  if (error instanceof Error) {
    return `safebits API cannot start: ${error.message}`;
  }
  return 'safebits API cannot start: unknown error';
}
