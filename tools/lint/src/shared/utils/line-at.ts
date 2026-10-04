export function lineAt(text: string, index: number): number {
  return text.slice(0, index).split('\n').length;
}
