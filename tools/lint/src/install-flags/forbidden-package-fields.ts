import { z } from 'zod';

export function forbiddenPackageFields(text: string, fields: readonly string[]): readonly string[] {
  const manifest = z.record(z.string(), z.unknown()).parse(JSON.parse(text));
  return fields.filter((field) => Object.hasOwn(manifest, field));
}
