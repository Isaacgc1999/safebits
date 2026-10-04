export function forbiddenNpmrcSettings(text: string, settings: readonly string[]): readonly string[] {
  const enabled = new Set(
    text.split(/\r?\n/).flatMap((line) => {
      const separator = line.indexOf('=');
      if (separator === -1) {
        return [];
      }
      return line.slice(separator + 1).trim() === 'true' ? [line.slice(0, separator).trim()] : [];
    }),
  );
  return settings.filter((setting) => enabled.has(setting));
}
