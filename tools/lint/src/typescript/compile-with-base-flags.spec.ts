import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { compileWithBaseFlags } from './compile-with-base-flags.js';

const baseConfig = fileURLToPath(new URL('../../../../tsconfig.base.json', import.meta.url));
const fixture = (name: string): string => fileURLToPath(new URL(`../../fixtures/typescript/${name}`, import.meta.url));
const IMPLICIT_ANY_PARAMETER = 7006;
const NOT_ASSIGNABLE = 2322;

describe('strict TypeScript base flags', () => {
  it('reject an implicit any parameter', () => {
    expect(compileWithBaseFlags(baseConfig, fixture('implicit-any.ts'))).toContain(IMPLICIT_ANY_PARAMETER);
  });

  it('reject an unchecked index access', () => {
    expect(compileWithBaseFlags(baseConfig, fixture('unchecked-index.ts'))).toContain(NOT_ASSIGNABLE);
  });

  it('accept code that handles the missing element', () => {
    expect(compileWithBaseFlags(baseConfig, fixture('valid.ts'))).toEqual([]);
  });
});
