export function commentEnd(text: string, start: number, isBlock: boolean): number {
  const end = isBlock ? text.indexOf('*/', start + 2) : text.indexOf('\n', start);
  return end === -1 ? text.length : end;
}
