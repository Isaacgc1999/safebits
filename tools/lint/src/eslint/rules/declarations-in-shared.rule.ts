import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../create-rule.js';
import type { DeclarationKind } from '../../shared/types/declaration-kind.type.js';
import { expectedFolders } from '../../shared/utils/expected-folders.js';
import { isExemptFile } from '../../shared/utils/is-exempt-file.js';
import { isInSharedFolder } from '../../shared/utils/is-in-shared-folder.js';
import { isLiteralInitializer } from '../../shared/utils/is-literal-initializer.js';
import { isModelClassName } from '../../shared/utils/is-model-class-name.js';

export const declarationsInSharedRule = createRule({
  name: 'declarations-in-shared',
  meta: {
    type: 'suggestion',
    docs: { description: 'Require interfaces, types, enums, constants and models to live in their shared folder' },
    messages: { misplaced: 'Declare this {{kind}} in a shared {{folder}} folder, not here.' },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    if (isExemptFile(context.filename)) {
      return {};
    }
    const check = (node: TSESTree.Node, kind: DeclarationKind): void => {
      const folders = expectedFolders(kind);
      if (!isInSharedFolder(context.filename, folders)) {
        context.report({ node, messageId: 'misplaced', data: { kind, folder: folders.join(' or ') } });
      }
    };
    return {
      TSInterfaceDeclaration: (node): void => {
        check(node, 'interface');
      },
      TSTypeAliasDeclaration: (node): void => {
        check(node, 'type');
      },
      TSEnumDeclaration: (node): void => {
        check(node, 'enum');
      },
      'Program > VariableDeclaration, Program > ExportNamedDeclaration > VariableDeclaration': (
        node: TSESTree.VariableDeclaration,
      ): void => {
        if (node.kind === 'const' && node.declarations.some((declarator) => isLiteralInitializer(declarator.init))) {
          check(node, 'constant');
        }
      },
      ClassDeclaration: (node): void => {
        if (node.id !== null && isModelClassName(node.id.name)) {
          check(node, 'model');
        }
      },
    };
  },
});
