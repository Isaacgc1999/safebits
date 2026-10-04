import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

export function runBiomeLint(configDirectory: string, file: string): number | null {
  const biomeEntry = createRequire(import.meta.url).resolve('@biomejs/biome/bin/biome');
  const result = spawnSync(
    process.execPath,
    [biomeEntry, 'lint', '--error-on-warnings', '--config-path', configDirectory, file],
    { encoding: 'utf8' },
  );
  return result.status;
}
