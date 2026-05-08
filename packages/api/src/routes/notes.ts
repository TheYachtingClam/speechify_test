import { Router, Response } from 'express';
import { DB } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

interface Note {
  id: number;
  user_id: number;
  title: string;
  content: string;
  tags: string;
  created_at: string;
  updated_at: string;
}

export function createNotesRouter(db: DB) {
  const router = Router();

  router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
    const userId = req.userId!;

    const notes = db.prepare('SELECT * FROM notes WHERE user_id = ?').all(userId) as Note[];

    const result = notes.map((note) => {
      const author = db.prepare('SELECT id, email, name FROM users WHERE id = ?').get(note.user_id);
      return { ...note, author };
    });

    res.json(result);
  });

  router.get('/search', authMiddleware, (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    const q = req.query.q as string;

    if (!q) {
      return res.status(400).json({ error: 'q parameter is required' });
    }

    const pattern = `%${q}%`;
    const notes = db.prepare(
      'SELECT * FROM notes WHERE user_id = ? AND (title LIKE ? OR content LIKE ?)'
    ).all(userId, pattern, pattern) as unknown as Note[];

    res.json(notes);
  });

  router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    const { title, content, tags } = req.body;

    const result = db.prepare(
      'INSERT INTO notes (user_id, title, content, tags) VALUES (?, ?, ?, ?)'
    ).run(userId, title, content || '', JSON.stringify(tags || []));

    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(Number(result.lastInsertRowid));
    res.status(201).json(note);
  });

  router.patch('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    const noteId = parseInt(req.params.id, 10);
    const { title, content, tags } = req.body;

    const existing = db.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?').get(noteId, userId) as Note | undefined;
    if (!existing) {
      return res.status(404).json({ error: 'Note not found' });
    }

    db.prepare(`
      UPDATE notes
      SET title = ?, content = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title ?? existing.title,
      content ?? existing.content,
      tags != null ? JSON.stringify(tags) : existing.tags,
      noteId
    );

    const updated = db.prepare('SELECT * FROM notes WHERE id = ?').get(noteId);
    res.json(updated);
  });

  router.delete('/:id', (req: AuthRequest, res: Response) => {
    const noteId = parseInt(req.params.id, 10);

    db.prepare('DELETE FROM notes WHERE id = ?').run(noteId);
    res.json({ success: true });
  });

  return router;
}
