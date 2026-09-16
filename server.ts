import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { createExpressApp } from './server/app';
import { startAbandonedCartScheduler } from './server/whatsapp';

dotenv.config();

async function startServer() {
  const app = createExpressApp();
  const PORT = 3000;

  // Background schedulers (only in long-lived server)
  startAbandonedCartScheduler();

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`  SHAKIL BAG STORE Server running on http://0.0.0.0:${PORT}`);
    console.log(`  Founder: Mohammad Shakil | Phone: +91-7217876220`);
    console.log(`====================================================`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server boot error:', err);
});
