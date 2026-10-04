import { cruise } from 'dependency-cruiser';
import extractDepcruiseOptions from 'dependency-cruiser/config-utl/extract-depcruise-options';
import { violationRuleNames } from '../shared/utils/violation-rule-names.js';

export async function findLayerViolations(configPath: string, baseDirectory: string): Promise<readonly string[]> {
  const options = await extractDepcruiseOptions(configPath);
  const result = await cruise(['.'], { ...options, baseDir: baseDirectory, validate: true });
  return violationRuleNames(result.output);
}
