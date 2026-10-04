import type { TSESLint } from '@typescript-eslint/utils';

export interface LocalPlugin {
  readonly meta: { readonly name: string };
  readonly rules: Readonly<Record<string, TSESLint.LooseRuleDefinition>>;
}
