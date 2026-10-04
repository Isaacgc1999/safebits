import type { BootstrapDependencies } from './shared/interfaces/bootstrap-dependencies.interface.js';
import { describeStartupError } from './shared/utils/describe-startup-error.js';
import { loadEnv } from './shared/utils/load-env.js';

export async function bootstrap(
  source: Readonly<Record<string, string | undefined>>,
  dependencies: BootstrapDependencies,
): Promise<number> {
  try {
    await dependencies.start(loadEnv(source));
    return 0;
  } catch (error: unknown) {
    dependencies.errorOutput.write(`${describeStartupError(error)}\n`);
    return 1;
  }
}
