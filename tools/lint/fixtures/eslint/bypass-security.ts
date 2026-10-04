interface Sanitizer {
  bypassSecurityTrustHtml(value: string): unknown;
}

export function trust(sanitizer: Sanitizer, value: string): unknown {
  return sanitizer.bypassSecurityTrustHtml(value);
}
