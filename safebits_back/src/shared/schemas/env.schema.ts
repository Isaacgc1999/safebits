import { z } from 'zod';
import { LOG_LEVELS } from '../constants/log-levels.constants.js';
import { RUNTIME_ENVIRONMENTS } from '../constants/runtime-environments.constants.js';

export const envSchema = z.object({
  NODE_ENV: z.enum(RUNTIME_ENVIRONMENTS),
  HOST: z.string().min(1).default('0.0.0.0'),
  PORT: z.coerce.number().int().min(1).max(65_535),
  LOG_LEVEL: z.enum(LOG_LEVELS).default('info'),
});
