import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { findLayerViolations } from './find-layer-violations.js';

const configPath = fileURLToPath(new URL('../../../../.dependency-cruiser.json', import.meta.url));
const fixtures = fileURLToPath(new URL('../../fixtures/depcruise', import.meta.url));

describe('layer rules', { timeout: 30_000 }, () => {
  it('reports every forbidden dependency in the violating fixture', async () => {
    const rules = new Set(await findLayerViolations(configPath, fixtures));
    expect([...rules].sort()).toEqual([
      'no-back-shared-to-modules',
      'no-circular',
      'no-core-to-features',
      'no-cross-feature-imports',
      'no-cross-module-imports',
      'no-shared-package-to-apps',
      'no-shared-to-features',
    ]);
  });
});
