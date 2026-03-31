import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createApiRouter } from './api/index.js';
import { buildDependencies } from './dependencies.js';
import { createRequestLogger } from './core/logger.js';
import { sendError } from './core/response.js';

export async function createApp() {
  const app = express();
  const deps = await buildDependencies();

  app.use(
    cors({
      origin: deps.env.FRONTEND_ORIGIN,
      credentials: true
    })
  );
  app.use(createRequestLogger());
  app.use(express.json());
  app.use(cookieParser());
  app.use(deps.requireCsrf);

  app.use(
    '/v1',
    createApiRouter({
      authController: deps.authController,
      adminController: deps.adminController,
      healthController: deps.healthController,
      authGuard: deps.authGuard,
      publicController: deps.publicController
    })
  );

  app.use((error, _req, res) => sendError(res, error));

  return app;
}
