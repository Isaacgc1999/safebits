import { createRule } from '../create-rule.js';

export const noCommentsRule = createRule({
  name: 'no-comments',
  meta: {
    type: 'suggestion',
    docs: { description: 'Disallow comments in source files and templates' },
    messages: { noComment: 'Comments are not allowed. Express intent with names, types and tests instead.' },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      Program(): void {
        for (const comment of context.sourceCode.getAllComments()) {
          context.report({ loc: comment.loc, messageId: 'noComment' });
        }
      },
    };
  },
});
