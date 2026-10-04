import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import { LITERAL_NODE_TYPES } from '../constants/literal-node-types.constants.js';

export function isLiteralInitializer(node: TSESTree.Expression | null): boolean {
  if (node === null) {
    return false;
  }
  if (node.type === AST_NODE_TYPES.TSAsExpression || node.type === AST_NODE_TYPES.TSSatisfiesExpression) {
    return isLiteralInitializer(node.expression);
  }
  if (node.type === AST_NODE_TYPES.TemplateLiteral) {
    return node.expressions.length === 0;
  }
  return LITERAL_NODE_TYPES.has(node.type);
}
