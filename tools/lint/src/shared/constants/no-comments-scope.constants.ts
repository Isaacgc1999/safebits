export const NO_COMMENTS_PATTERNS: readonly string[] = ['**/*.css', '**/*.sql', '**/*.json'];

export const NO_COMMENTS_EXCLUDED_SEGMENTS: readonly string[] = [
  'node_modules',
  'dist',
  'coverage',
  '.angular',
  '.git',
  '.claude',
  'openspec',
  'docs',
  'safebits-diseno',
  'fixtures',
];

export const NO_COMMENTS_EXCLUDED_FILES: readonly string[] = ['package-lock.json'];
