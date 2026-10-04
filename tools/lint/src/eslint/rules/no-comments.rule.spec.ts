import templateParser from '@angular-eslint/template-parser';
import { createRuleTester } from '../rule-tester.js';
import { noCommentsRule } from './no-comments.rule.js';

const ruleTester = createRuleTester();
const template = { languageOptions: { parser: templateParser } };

ruleTester.run('no-comments', noCommentsRule, {
  valid: [
    { code: 'export const total = 1;' },
    { code: "export const markup = '<!-- not a comment in TypeScript -->';", filename: 'markup.ts' },
    { code: '<p>Tu semana</p>', filename: 'week.html', ...template },
  ],
  invalid: [
    { code: '// note\nexport const total = 1;', errors: [{ messageId: 'noComment' }] },
    { code: '/* block */ export const total = 1;', errors: [{ messageId: 'noComment' }] },
    { code: '/** docs */\nexport function total(): number { return 1; }', errors: [{ messageId: 'noComment' }] },
    {
      code: '<p>Tu semana</p><!-- note --><span>Lista</span><!-- second -->',
      filename: 'week.html',
      ...template,
      errors: [{ messageId: 'noComment' }, { messageId: 'noComment' }],
    },
  ],
});
