import { describe, expect, it } from 'vitest';
import { violationRuleNames } from './violation-rule-names.js';

describe('violationRuleNames', () => {
  it('returns no rule names for a textual report', () => {
    expect(violationRuleNames('report text')).toEqual([]);
  });
});
