import { EXEMPT_FILE_SUFFIXES, SOURCE_SEGMENT } from '../constants/declaration-folders.constants.js';
import { pathSegments } from './path-segments.js';

export function isExemptFile(filename: string): boolean {
  const normalized = filename.replaceAll('\\', '/');
  const insideSource = pathSegments(filename).includes(SOURCE_SEGMENT);
  return !insideSource || EXEMPT_FILE_SUFFIXES.some((suffix) => normalized.endsWith(suffix));
}
