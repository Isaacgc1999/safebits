import { formatDocumentTitle } from './format-document-title';

describe('formatDocumentTitle', () => {
  it('uses the product name when the page has no title', () => {
    expect(formatDocumentTitle(undefined)).toBe('safebits');
  });

  it('uses the product name when the page title is blank', () => {
    expect(formatDocumentTitle('   ')).toBe('safebits');
  });

  it('appends the product name to the page title', () => {
    expect(formatDocumentTitle('Semana')).toBe('Semana · safebits');
  });
});
