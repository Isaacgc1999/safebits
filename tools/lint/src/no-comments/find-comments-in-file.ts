import { extname } from 'node:path';
import { findCodeComments } from './find-code-comments.js';
import { findCssComments } from './find-css-comments.js';

export function findCommentsInFile(file: string, text: string): readonly number[] {
  const extension = extname(file);
  if (extension === '.css') {
    return findCssComments(text);
  }
  return findCodeComments(text, extension === '.sql' ? '--' : '//');
}
