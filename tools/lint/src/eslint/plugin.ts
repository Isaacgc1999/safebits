import type { LocalPlugin } from '../shared/interfaces/local-plugin.interface.js';
import { declarationsInSharedRule } from './rules/declarations-in-shared.rule.js';
import { lazyFeatureRoutesRule } from './rules/lazy-feature-routes.rule.js';
import { noCommentsRule } from './rules/no-comments.rule.js';

export function createLocalPlugin(): LocalPlugin {
  return {
    meta: { name: 'local' },
    rules: {
      'no-comments': noCommentsRule,
      'declarations-in-shared': declarationsInSharedRule,
      'lazy-feature-routes': lazyFeatureRoutesRule,
    },
  };
}
