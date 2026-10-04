import { AST_NODE_TYPES } from '@typescript-eslint/utils';

export const LITERAL_NODE_TYPES: ReadonlySet<AST_NODE_TYPES> = new Set([
  AST_NODE_TYPES.Literal,
  AST_NODE_TYPES.ObjectExpression,
  AST_NODE_TYPES.ArrayExpression,
]);
