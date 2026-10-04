import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { findForbiddenInstallSettings } from './find-forbidden-install-settings.js';

function createWorkspace(files: Readonly<Record<string, string>>): string {
  const root = mkdtempSync(join(tmpdir(), 'safebits-install-flags-'));
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(join(root, file, '..'), { recursive: true });
    writeFileSync(join(root, file), content);
  }
  return root;
}

describe('findForbiddenInstallSettings', () => {
  it('reports overrides and resolutions in any workspace manifest', () => {
    const root = createWorkspace({
      'package.json': JSON.stringify({ name: 'root', overrides: { braces: '3.0.3' } }),
      'packages/shared/package.json': JSON.stringify({ name: 'shared', resolutions: { a: '1' } }),
    });
    expect(findForbiddenInstallSettings(root)).toEqual([
      'package.json: overrides is not allowed',
      'packages/shared/package.json: resolutions is not allowed',
    ]);
  });

  it('reports legacy peer dependency resolution and forced installs in .npmrc', () => {
    const root = createWorkspace({
      'package.json': JSON.stringify({ name: 'root' }),
      '.npmrc': 'engine-strict=true\nlegacy-peer-deps = true\r\nforce=true\nfund\n',
    });
    expect(findForbiddenInstallSettings(root)).toEqual([
      '.npmrc: legacy-peer-deps is not allowed',
      '.npmrc: force is not allowed',
    ]);
  });

  it('ignores installed dependencies and accepts clean configuration', () => {
    const root = createWorkspace({
      'package.json': JSON.stringify({ name: 'root' }),
      '.npmrc': 'engine-strict=true\nforce=false\n',
      'node_modules/pkg/package.json': JSON.stringify({ name: 'pkg', overrides: {} }),
    });
    expect(findForbiddenInstallSettings(root)).toEqual([]);
  });
});
