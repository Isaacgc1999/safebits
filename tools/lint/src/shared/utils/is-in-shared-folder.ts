import { SHARED_SEGMENT } from '../constants/declaration-folders.constants.js';
import { pathSegments } from './path-segments.js';

export function isInSharedFolder(filename: string, folders: readonly string[]): boolean {
  const segments = pathSegments(filename);
  return segments.includes(SHARED_SEGMENT) && folders.some((folder) => segments.includes(folder));
}
