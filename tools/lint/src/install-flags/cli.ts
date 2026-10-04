import { findForbiddenInstallSettings } from './find-forbidden-install-settings.js';

const findings = findForbiddenInstallSettings(process.cwd());
for (const finding of findings) {
  process.stderr.write(`${finding}\n`);
}
process.exitCode = findings.length === 0 ? 0 : 1;
