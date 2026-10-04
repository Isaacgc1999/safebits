import type { ICruiseResult } from 'dependency-cruiser';

export function violationRuleNames(output: string | ICruiseResult): readonly string[] {
  if (typeof output === 'string') {
    return [];
  }
  return output.summary.violations.map((violation) => violation.rule.name);
}
