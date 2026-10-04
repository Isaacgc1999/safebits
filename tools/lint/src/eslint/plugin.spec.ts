import { describe, expect, it } from 'vitest';
import { createLocalPlugin } from './plugin.js';

describe('createLocalPlugin', () => {
  it('exposes the local rules under the local namespace', () => {
    const plugin = createLocalPlugin();
    expect(plugin.meta.name).toBe('local');
    expect(Object.keys(plugin.rules)).toEqual(['no-comments', 'declarations-in-shared', 'lazy-feature-routes']);
  });
});
