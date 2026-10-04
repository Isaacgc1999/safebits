import { ESLintUtils } from '@typescript-eslint/utils';
import { RULE_DOCS_BASE_URL } from '../shared/constants/rule-docs.constants.js';

export const createRule = ESLintUtils.RuleCreator((name) => `${RULE_DOCS_BASE_URL}${name}`);
