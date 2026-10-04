export const FORBIDDEN_PACKAGE_FIELDS: readonly string[] = ['overrides', 'resolutions'];

export const FORBIDDEN_NPMRC_SETTINGS: readonly string[] = ['legacy-peer-deps', 'force'];

export const INSTALL_CONFIG_PATTERNS: readonly string[] = [
  'package.json',
  '*/package.json',
  '*/*/package.json',
  '.npmrc',
  '*/.npmrc',
  '*/*/.npmrc',
];
