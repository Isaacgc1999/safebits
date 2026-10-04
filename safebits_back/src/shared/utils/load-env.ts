import { envSchema } from '../schemas/env.schema.js';
import { EnvValidationError } from '../models/env-validation.error.js';
import type { Env } from '../types/env.type.js';

export function loadEnv(source: Readonly<Record<string, string | undefined>>): Env {
  const result = envSchema.safeParse(source);
  if (result.success) {
    return result.data;
  }
  const problems = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
  throw new EnvValidationError(problems);
}
