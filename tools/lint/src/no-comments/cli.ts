import { runCheck } from './run-check.js';

process.exitCode = runCheck(process.cwd(), (message) => {
  process.stderr.write(message);
});
