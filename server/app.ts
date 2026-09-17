import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes';
import { initDatabase } from './db';

dotenv.config();

export function createExpressApp() {
  const app = express();

  // Netlify Functions path rewriting:
  // When Netlify rewrites /.netlify/functions/api/*, normalize to /api/*
  app.use((req, _res, next) => {
    if (req.url.startsWith('/.netlify/functions/api')) {
      req.url = req.url.replace('/.netlify/functions/api', '/api');
    }
    next();
  });

  // Middlewares
  app.use(
    cors({
      origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
      credentials: true
    })
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Ensure DB connection is active before processing API calls
  app.use(async (_req, _res, next) => {
    try {
      await initDatabase();
    } catch (e) {
      console.error('Database connection error in request middleware:', e);
    }
    next();
  });

  // Health check endpoint
  const healthHandler = (_req: express.Request, res: express.Response) => {
    res.json({
      status: 'ok',
      store: 'SHAKIL BAG STORE',
      owner: 'Mohammad Shakil',
      time: new Date().toISOString()
    });
  };

  app.get('/health', healthHandler);
  app.get('/api/health', healthHandler);

  // Mount primary REST API routes on all possible Netlify function paths
  // This ensures requests work whether Netlify preserves or strips the /api prefix
  app.use('/.netlify/functions/api', apiRouter);
  app.use('/api', apiRouter);
  app.use('/', apiRouter);

  return app;
}
