export function pathSegments(filename: string): readonly string[] {
  return filename.replaceAll('\\', '/').split('/');
}
