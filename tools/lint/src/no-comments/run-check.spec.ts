import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { listCheckedFiles } from './list-checked-files.js';
import { runCheck } from './run-check.js';

function createWorkspace(files: Readonly<Record<string, string>>): string {
  const root = mkdtempSync(join(tmpdir(), 'safebits-no-comments-'));
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(join(root, file, '..'), { recursive: true });
    writeFileSync(join(root, file), content);
  }
  return root;
}

describe('runCheck', () => {
  it('fails and names each file and line with a comment', () => {
    const root = createWorkspace({ 'src/styles.css': '/* note */\n', 'supabase/a.sql': 'select 1;\n-- note\n' });
    const output: string[] = [];
    expect(runCheck(root, (message) => output.push(message))).toBe(1);
    expect(output.join('')).toContain('src/styles.css:1 comments are not allowed');
    expect(output.join('')).toContain('supabase/a.sql:2 comments are not allowed');
  });

  it('passes when no file has comments', () => {
    const root = createWorkspace({ 'src/styles.css': '.a { color: red; }\n', 'config.json': '{ "a": 1 }\n' });
    const output: string[] = [];
    expect(runCheck(root, (message) => output.push(message))).toBe(0);
    expect(output).toEqual([]);
  });
});

describe('listCheckedFiles', () => {
  it('skips dependencies, build output, lockfiles and fixtures', () => {
    const root = createWorkspace({
      'config.json': '{}',
      'package-lock.json': '{}',
      'node_modules/pkg/package.json': '{}',
      'app/dist/app.css': '',
      'tools/lint/fixtures/bad.json': '{}',
      'app/src/styles.css': '',
    });
    const checkedFiles = [...listCheckedFiles(root)].map((file) => file.replaceAll('\\', '/'));
    expect(checkedFiles.toSorted((first, second) => first.localeCompare(second))).toEqual([
      'app/src/styles.css',
      'config.json',
    ]);
  });
});
