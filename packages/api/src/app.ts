import express from 'express';
import cors from 'cors';
import { DB } from './db';
import { createAuthRouter } from './routes/auth';
import { createNotesRouter } from './routes/notes';

export function createApp(db: DB) {
  const app = express();

  app.use(cors({ origin: '*' }));
  app.use(express.json());

  app.use('/auth', createAuthRouter(db));
  app.use('/notes', createNotesRouter(db));

  return app;
}
