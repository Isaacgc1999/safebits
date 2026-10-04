import type { Env } from '../types/env.type.js';

export interface BootstrapDependencies {
  readonly start: (env: Env) => Promise<unknown>;
  readonly errorOutput: { write: (message: string) => unknown };
}
