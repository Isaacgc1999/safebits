import { globSync } from 'node:fs';
import { basename } from 'node:path';
import {
  NO_COMMENTS_EXCLUDED_FILES,
  NO_COMMENTS_EXCLUDED_SEGMENTS,
  NO_COMMENTS_PATTERNS,
} from '../shared/constants/no-comments-scope.constants.js';
import { pathSegments } from '../shared/utils/path-segments.js';

export function listCheckedFiles(root: string): readonly string[] {
  return globSync([...NO_COMMENTS_PATTERNS], {
    cwd: root,
    exclude: (path: string) => NO_COMMENTS_EXCLUDED_SEGMENTS.includes(basename(path)),
  })
    .map((file) => file.replaceAll('\\', '/'))
    .filter(
      (file) =>
        !NO_COMMENTS_EXCLUDED_FILES.includes(basename(file)) &&
        !pathSegments(file).some((segment) => NO_COMMENTS_EXCLUDED_SEGMENTS.includes(segment)),
    );
}
