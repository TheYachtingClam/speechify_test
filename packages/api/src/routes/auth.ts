import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { DB } from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'notes-app-jwt-secret-2024';

export function createAuthRouter(db: DB) {
  const router = Router();

  router.post('/register', (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'email and name are required' });
    }

    try {
      const stmt = db.prepare(
        'INSERT INTO users (email, password, name) VALUES (?, ?, ?)'
      );
      const result = stmt.run(email, password, name);
      const lastId = Number(result.lastInsertRowid);

      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(lastId);
      const token = jwt.sign({ userId: lastId }, JWT_SECRET, { expiresIn: '30d' });

      res.status(201).json({ token, user });
    } catch (err: any) {
      if (err.message?.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Email already registered' });
      }
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  router.post('/login', (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

    res.json({ token, user });
  });

  return router;
}
