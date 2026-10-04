import type { CommentFinding } from '../shared/interfaces/comment-finding.interface.js';
import { checkFiles } from './check-files.js';
import { listCheckedFiles } from './list-checked-files.js';

export function runCheck(root: string, write: (message: string) => void): number {
  const findings: readonly CommentFinding[] = checkFiles(root, listCheckedFiles(root));
  for (const finding of findings) {
    write(`${finding.file}:${String(finding.line)} comments are not allowed\n`);
  }
  return findings.length === 0 ? 0 : 1;
}
