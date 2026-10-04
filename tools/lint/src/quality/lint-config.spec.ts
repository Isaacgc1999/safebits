import { copyFile, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';
import { BIOME_FIXTURE_CONFIG } from '../shared/constants/biome-fixture-config.constants.js';
import type { FixtureCase } from '../shared/interfaces/fixture-case.interface.js';
import { isPrettierFormatted } from './is-prettier-formatted.js';
import { runBiomeLint } from './run-biome-lint.js';

const repositoryRoot = fileURLToPath(new URL('../../../../', import.meta.url));
const fixtures = fileURLToPath(new URL('../../fixtures/', import.meta.url));
const eslint = new ESLint({ cwd: repositoryRoot, ignore: false });

const cases: readonly FixtureCase[] = [
  { file: 'no-explicit-any.ts', rule: '@typescript-eslint/no-explicit-any' },
  { file: 'type-assertion.ts', rule: '@typescript-eslint/consistent-type-assertions' },
  { file: 'return-type.ts', rule: '@typescript-eslint/explicit-function-return-type' },
  { file: 'long-function.ts', rule: 'max-lines-per-function' },
  { file: 'complexity.ts', rule: 'complexity' },
  { file: 'max-depth.ts', rule: 'max-depth' },
  { file: 'max-params.ts', rule: 'max-params' },
  { file: 'no-console.ts', rule: 'no-console' },
  { file: 'inner-html.ts', rule: 'no-restricted-syntax' },
  { file: 'bypass-security.ts', rule: 'no-restricted-syntax' },
  { file: 'comment.ts', rule: 'local/no-comments' },
  { file: 'inline-disable.ts', rule: 'local/no-comments' },
  { file: 'src/features/week/week.ts', rule: 'local/declarations-in-shared' },
  { file: 'src/app.routes.ts', rule: 'local/lazy-feature-routes' },
  { file: 'angular/no-on-push.component.ts', rule: '@angular-eslint/prefer-on-push-component-change-detection' },
  { file: 'angular/decorator-input.component.ts', rule: '@angular-eslint/prefer-signals' },
  { file: 'angular/not-standalone.component.ts', rule: '@angular-eslint/prefer-standalone' },
  { file: 'angular/wrong-prefix.component.ts', rule: '@angular-eslint/component-selector' },
  { file: 'angular/template-comment.html', rule: 'local/no-comments' },
  { file: 'angular/inner-html.html', rule: 'no-restricted-syntax' },
  { file: 'angular/missing-alt.html', rule: '@angular-eslint/template/alt-text' },
];

async function ruleIdsFor(file: string): Promise<readonly (string | null)[]> {
  const [result] = await eslint.lintFiles([`${fixtures}eslint/${file}`]);
  return result?.messages.map((message) => message.ruleId) ?? [];
}

describe('root lint configuration', { timeout: 30_000 }, () => {
  it.each(cases)('reports $rule for $file', async ({ file, rule }) => {
    expect(await ruleIdsFor(file)).toContain(rule);
  });

  it('ignores inline configuration comments', async () => {
    const [result] = await eslint.lintFiles([`${fixtures}eslint/inline-disable.ts`]);
    expect(result?.messages.map((message) => message.ruleId)).toContain('no-console');
  });

  it('fails Biome on invalid CSS', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'safebits-biome-'));
    await writeFile(join(directory, 'biome.json'), JSON.stringify(BIOME_FIXTURE_CONFIG));
    await copyFile(`${fixtures}biome/invalid.css`, join(directory, 'invalid.css'));
    expect(runBiomeLint(directory, join(directory, 'invalid.css'))).not.toBe(0);
  });

  it('applies Prettier defaults when no configuration exists', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'safebits-prettier-'));
    const file = join(directory, 'formatted.ts');
    await writeFile(file, 'export const total = 1;\n');
    expect(await isPrettierFormatted(file)).toBe(true);
  });

  it('fails Prettier on unformatted code', async () => {
    expect(await isPrettierFormatted(`${fixtures}prettier/unformatted.ts`)).toBe(false);
  });

  it('accepts code that Prettier already formatted', async () => {
    expect(await isPrettierFormatted(fileURLToPath(new URL('./is-prettier-formatted.ts', import.meta.url)))).toBe(true);
  });
});
