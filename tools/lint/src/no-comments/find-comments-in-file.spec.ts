import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { findCommentsInFile } from './find-comments-in-file.js';

const fixture = (name: string): string => fileURLToPath(new URL(`../../fixtures/no-comments/${name}`, import.meta.url));
const read = (name: string): string => readFileSync(fixture(name), 'utf8');

describe('findCommentsInFile', () => {
  it('finds CSS comments but not comment markers inside strings', () => {
    expect(findCommentsInFile('styles.css', read('styles.css'))).toEqual([4]);
  });

  it('finds SQL line comments and comments inside function bodies', () => {
    expect(findCommentsInFile('migration.sql', read('migration.sql'))).toEqual([2, 4]);
  });

  it('finds JSON comments but not slashes inside strings', () => {
    expect(findCommentsInFile('config.json', read('config.json'))).toEqual([4]);
  });

  it('reports an unclosed block comment once', () => {
    expect(findCommentsInFile('broken.json', '{ "a": 1 }\n/* never closed')).toEqual([2]);
  });

  it('accepts files without comments', () => {
    expect(findCommentsInFile('clean.json', '{ "a": "b" }')).toEqual([]);
  });
});
