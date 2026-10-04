import { readFile } from 'node:fs/promises';
import { check, resolveConfig } from 'prettier';

export async function isPrettierFormatted(file: string): Promise<boolean> {
  const options = (await resolveConfig(file)) ?? {};
  return check(await readFile(file, 'utf8'), { ...options, filepath: file });
}
