import { globSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import {
  FORBIDDEN_NPMRC_SETTINGS,
  FORBIDDEN_PACKAGE_FIELDS,
  INSTALL_CONFIG_PATTERNS,
} from '../shared/constants/install-flags.constants.js';
import { forbiddenNpmrcSettings } from './forbidden-npmrc-settings.js';
import { forbiddenPackageFields } from './forbidden-package-fields.js';

export function findForbiddenInstallSettings(root: string): readonly string[] {
  return globSync([...INSTALL_CONFIG_PATTERNS], {
    cwd: root,
    exclude: (path: string) => basename(path) === 'node_modules',
  })
    .map((file) => file.replaceAll('\\', '/'))
    .flatMap((file) => {
      const text = readFileSync(join(root, file), 'utf8');
      const found = file.endsWith('.npmrc')
        ? forbiddenNpmrcSettings(text, FORBIDDEN_NPMRC_SETTINGS)
        : forbiddenPackageFields(text, FORBIDDEN_PACKAGE_FIELDS);
      return found.map((setting) => `${file}: ${setting} is not allowed`);
    });
}
