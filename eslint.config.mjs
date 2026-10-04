import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import prettier from 'eslint-config-prettier';
import sonarjs from 'eslint-plugin-sonarjs';
import { createLocalPlugin } from '@safebits/lint/eslint';

const local = createLocalPlugin();

const securityBans = [
  'error',
  {
    selector: "MemberExpression[property.name='innerHTML'], MemberExpression[property.name='outerHTML']",
    message: 'Do not write HTML directly; render text through Angular bindings.',
  },
  {
    selector: 'MemberExpression[property.name=/^bypassSecurityTrust/]',
    message: 'Do not bypass Angular sanitisation.',
  },
];

const angularFiles = ['safebits_front/**/*.ts', 'tools/lint/fixtures/eslint/angular/**/*.ts'];
const templateFiles = ['safebits_front/**/*.html', 'tools/lint/fixtures/eslint/angular/**/*.html'];

export default defineConfig(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.angular/**',
      'openspec/**',
      'docs/**',
      'safebits-diseno/**',
      '.claude/**',
      'tools/lint/fixtures/**',
    ],
  },
  {
    linterOptions: { noInlineConfig: true, reportUnusedDisableDirectives: 'off' },
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    extends: [eslint.configs.recommended, sonarjs.configs.recommended],
    plugins: { local },
    rules: { 'local/no-comments': 'error' },
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      sonarjs.configs.recommended,
    ],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    plugins: { local },
    rules: {
      '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      'max-lines-per-function': ['error', { max: 40, skipBlankLines: true, skipComments: true }],
      complexity: ['error', 8],
      'max-depth': ['error', 3],
      'max-params': ['error', 3],
      'no-console': 'error',
      'no-restricted-syntax': securityBans,
      'local/no-comments': 'error',
      'local/declarations-in-shared': 'error',
      'local/lazy-feature-routes': 'error',
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: { 'max-lines-per-function': 'off' },
  },
  {
    files: angularFiles,
    extends: [angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'sb', style: 'kebab-case' }],
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'sb', style: 'camelCase' }],
      '@angular-eslint/prefer-on-push-component-change-detection': ['error', { allowExplicitOnPush: false }],
      '@angular-eslint/prefer-signals': 'error',
      '@angular-eslint/prefer-standalone': 'error',
    },
  },
  {
    files: templateFiles,
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    plugins: { local },
    rules: {
      'local/no-comments': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: "BoundAttribute[name='innerHTML'], BoundAttribute[name='outerHTML']",
          message: 'Do not bind HTML; render text through Angular bindings.',
        },
      ],
    },
  },
  prettier,
);
