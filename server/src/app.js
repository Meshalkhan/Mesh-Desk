import express from 'express';

import cors from 'cors';

import chatRoutes from './routes/chatRoutes.js';

import authRoutes from './routes/authRoutes.js';

import userRoutes from './routes/userRoutes.js';

import groupChatRoutes from './routes/groupChatRoutes.js';

import adminUserRoutes from './routes/adminUserRoutes.js';

import adminSettingsRoutes from './routes/adminSettingsRoutes.js';

import adminAiModelRoutes from './routes/adminAiModelRoutes.js';

import aiModelRoutes from './routes/aiModelRoutes.js';

import publicRoutes from './routes/publicRoutes.js';

import { allowedOrigins } from './config/cors.js';

import { errorHandler } from './middleware/errorHandler.js';

import { notFound } from './middleware/notFound.js';

import { connectDB } from './config/db.js';

import { loadEnv } from './config/env.js';

import { bootstrapCore, settingsMiddleware } from './config/bootstrap.js';

import { ExternalServiceError } from './utils/appError.js';

import { requestContextMiddleware } from './middleware/requestContext.js';

import { requestLogger } from './middleware/requestLogger.js';

import { globalLimiter } from './middleware/rateLimit.js';

import { getLivenessPayload, getReadinessPayload, getRealtimeHealthPayload } from './services/healthService.js';

import { getLogger } from './config/logger.js';



async function dbMiddleware(_req, res, next) {

  const { databaseUrl } = loadEnv();

  if (!databaseUrl) {

    return next(

      new ExternalServiceError('Database not configured. Set DATABASE_URL in your environment variables.', {

        statusCode: 503,

        service: 'database',

      }),

    );

  }

  try {

    await bootstrapCore();

    await connectDB(databaseUrl);

    next();

  } catch (e) {

    next(e instanceof ExternalServiceError ? e : ExternalServiceError.fromCause('database', e));

  }

}



function mountApi(app) {

  app.use('/api/public', settingsMiddleware, publicRoutes);

  app.use('/api/auth', settingsMiddleware, authRoutes);

  app.use('/api/admin/users', dbMiddleware, adminUserRoutes);

  app.use('/api/admin/settings', dbMiddleware, adminSettingsRoutes);

  app.use('/api/admin/models', dbMiddleware, adminAiModelRoutes);

  app.use('/api/ai-models', dbMiddleware, aiModelRoutes);

  app.use('/api/users', dbMiddleware, userRoutes);

  app.use('/api/chats', dbMiddleware, chatRoutes);

  app.use('/api/group-chats', dbMiddleware, groupChatRoutes);

  app.use('/chats', dbMiddleware, chatRoutes);

}



export function createApp() {

  const app = express();



  app.use(requestContextMiddleware);

  app.use(requestLogger);



  app.use(

    cors({

      origin(origin, cb) {

        const ok = allowedOrigins();

        if (!origin) return cb(null, true);

        if (ok.includes(origin)) return cb(null, true);

        cb(null, false);

      },

      credentials: true,

    }),

  );

  app.use(express.json({ limit: '1mb' }));



  /** Liveness — no dependency checks; safe for frequent probes. */

  app.get('/health', (_req, res) => {

    res.json(getLivenessPayload());

  });



  /**

   * Readiness — per-dependency status (database, pusher, llm).

   * Note: the LLM check sends a minimal completion and may incur cost if polled aggressively.

   */

  app.get('/health/ready', settingsMiddleware, async (_req, res, next) => {

    try {

      const payload = await getReadinessPayload();

      res.status(payload.httpStatus).json(payload);

    } catch (error) {

      next(error);

    }

  });



  /** @deprecated Prefer GET /health/ready — returns pusher portion only for backward compatibility. */
  app.get('/api/health/realtime', settingsMiddleware, async (_req, res, next) => {
    try {
      const pusher = await getRealtimeHealthPayload();
      const statusCode =
        pusher.status === 'ok' ? 200 : pusher.status === 'degraded' ? 503 : 502;
      res.status(statusCode).json(pusher);
    } catch (error) {
      next(error);
    }
  });



  app.use('/api', globalLimiter);

  mountApi(app);



  app.use(notFound);

  app.use(errorHandler);



  return app;

}



export { getLogger };


