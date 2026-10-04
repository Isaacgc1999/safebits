import type { ScannerState } from '../shared/types/scanner-state.type.js';
import { commentEnd } from '../shared/utils/comment-end.js';
import { lineAt } from '../shared/utils/line-at.js';
import { nextScannerState } from '../shared/utils/next-scanner-state.js';

export function findCodeComments(text: string, lineMarker: string): readonly number[] {
  const lines: number[] = [];
  let state: ScannerState = 'code';
  let escaped = false;
  let index = 0;
  while (index < text.length) {
    const pair = text.slice(index, index + 2);
    if (state === 'code' && (pair === lineMarker || pair === '/*')) {
      lines.push(lineAt(text, index));
      index = commentEnd(text, index, pair === '/*') + 1;
    } else {
      const character = text.charAt(index);
      state = nextScannerState(state, character, escaped);
      escaped = state !== 'code' && character === '\\' && !escaped;
      index += 1;
    }
  }
  return lines;
}
