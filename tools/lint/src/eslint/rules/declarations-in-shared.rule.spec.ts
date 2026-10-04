import { createRuleTester } from '../rule-tester.js';
import { declarationsInSharedRule } from './declarations-in-shared.rule.js';

const ruleTester = createRuleTester();
const feature = '/repo/safebits_front/src/app/features/week/week.ts';
const shared = (kind: string, file: string): string => `/repo/safebits_front/src/app/shared/${kind}/${file}`;

ruleTester.run('declarations-in-shared', declarationsInSharedRule, {
  valid: [
    { code: 'export interface Meal { readonly id: string; }', filename: shared('interfaces', 'meal.interface.ts') },
    { code: 'export type MealId = string;', filename: shared('types', 'meal-id.type.ts') },
    { code: 'export enum MealType { Breakfast }', filename: shared('enums', 'meal-type.enum.ts') },
    { code: "export const MEAL_TYPES = ['desayuno'] as const;", filename: shared('constants', 'meal.constants.ts') },
    { code: 'export const mealSchema = { type: 1 } satisfies object;', filename: shared('schemas', 'meal.schema.ts') },
    { code: 'export class EnvValidationError extends Error {}', filename: shared('models', 'env.error.ts') },
    {
      code: 'export interface Options { readonly a: number; }',
      filename: '/repo/packages/shared/src/interfaces/options.interface.ts',
    },
    { code: 'export interface Options { readonly a: number; }', filename: '/repo/safebits_back/vitest.config.ts' },
    { code: 'const LIMIT = 3;\nexport const value = LIMIT;', filename: '/repo/safebits_back/src/app.spec.ts' },
    { code: "export const routes = [{ path: '' }];", filename: '/repo/safebits_front/src/app/app.routes.ts' },
    { code: 'export const appConfig = { providers: [] };', filename: '/repo/safebits_front/src/app/app.config.ts' },
    { code: 'process.exitCode = 0;', filename: '/repo/safebits_back/src/main.ts' },
    { code: 'export const service = createService();', filename: feature },
    { code: 'export const label = `${prefix}-week`;', filename: feature },
    { code: 'let counter = 0;\nexport function next(): number { counter += 1; return counter; }', filename: feature },
    { code: 'export function limit(): number { const MAX = 3; return MAX; }', filename: feature },
    { code: 'export class WeekPage {}', filename: feature },
    { code: 'export default class {}', filename: feature },
    { code: 'export const missing = undefined;', filename: feature },
    { code: 'declare const VERSION: string;\nexport const version = VERSION;', filename: feature },
  ],
  invalid: [
    { code: 'export interface Meal { readonly id: string; }', filename: feature, errors: [{ messageId: 'misplaced' }] },
    { code: 'export type MealId = string;', filename: feature, errors: [{ messageId: 'misplaced' }] },
    { code: 'export enum MealType { Breakfast }', filename: feature, errors: [{ messageId: 'misplaced' }] },
    { code: "export const LABELS = { week: 'Semana' };", filename: feature, errors: [{ messageId: 'misplaced' }] },
    { code: 'const PAGE_SIZE = 100;', filename: feature, errors: [{ messageId: 'misplaced' }] },
    { code: 'export const TITLE = `Semana`;', filename: feature, errors: [{ messageId: 'misplaced' }] },
    { code: "export const DAYS = ['lun'] as const;", filename: feature, errors: [{ messageId: 'misplaced' }] },
    {
      code: 'export const DEFAULTS = { size: 1 } satisfies object;',
      filename: feature,
      errors: [{ messageId: 'misplaced' }],
    },
    { code: 'export class MealModel {}', filename: feature, errors: [{ messageId: 'misplaced' }] },
    { code: 'export class MissingMealError extends Error {}', filename: feature, errors: [{ messageId: 'misplaced' }] },
    {
      code: 'export interface Meal { readonly id: string; }',
      filename: shared('types', 'meal.ts'),
      errors: [{ messageId: 'misplaced' }],
    },
  ],
});
