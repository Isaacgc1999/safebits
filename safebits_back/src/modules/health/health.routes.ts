import type { FastifyPluginCallback } from 'fastify';
import { HEALTH_PATH } from '../../shared/constants/routes.constants.js';
import type { HealthResponse } from '../../shared/interfaces/health-response.interface.js';

export const healthRoutes: FastifyPluginCallback = (app, _options, done) => {
  app.get(HEALTH_PATH, (): HealthResponse => ({ status: 'ok' }));
  done();
};
