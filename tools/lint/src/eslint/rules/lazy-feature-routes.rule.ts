import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { createRule } from '../create-rule.js';
import { pathSegments } from '../../shared/utils/path-segments.js';

export const lazyFeatureRoutesRule = createRule({
  name: 'lazy-feature-routes',
  meta: {
    type: 'problem',
    docs: { description: 'Require feature routes to be lazy-loaded' },
    messages: {
      eagerComponent: 'Use loadComponent with a dynamic import instead of component.',
      eagerFeatureImport: 'Feature code must be imported lazily from route files.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    if (!context.filename.endsWith('.routes.ts')) {
      return {};
    }
    return {
      ImportDeclaration: (node): void => {
        if (node.importKind !== 'type' && pathSegments(node.source.value).includes('features')) {
          context.report({ node, messageId: 'eagerFeatureImport' });
        }
      },
      Property: (node): void => {
        if (node.key.type === AST_NODE_TYPES.Identifier && node.key.name === 'component') {
          context.report({ node, messageId: 'eagerComponent' });
        }
      },
    };
  },
});
