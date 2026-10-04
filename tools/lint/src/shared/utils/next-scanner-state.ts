import type { ScannerState } from '../types/scanner-state.type.js';

export function nextScannerState(state: ScannerState, character: string, escaped: boolean): ScannerState {
  if (state === 'code') {
    if (character === "'") {
      return 'single-quote';
    }
    return character === '"' ? 'double-quote' : 'code';
  }
  const closing = state === 'single-quote' ? "'" : '"';
  return character === closing && !escaped ? 'code' : state;
}
