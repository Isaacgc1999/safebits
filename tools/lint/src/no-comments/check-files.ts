import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { CommentFinding } from '../shared/interfaces/comment-finding.interface.js';
import { findCommentsInFile } from './find-comments-in-file.js';

export function checkFiles(root: string, files: readonly string[]): readonly CommentFinding[] {
  return files.flatMap((file) =>
    findCommentsInFile(file, readFileSync(join(root, file), 'utf8')).map((line) => ({ file, line })),
  );
}
