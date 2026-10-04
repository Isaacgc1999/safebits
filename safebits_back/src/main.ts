import { bootstrap } from './bootstrap.js';
import { startServer } from './server.js';

process.exitCode = await bootstrap(process.env, { start: startServer, errorOutput: process.stderr });
