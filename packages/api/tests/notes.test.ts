import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createDb } from '../src/db.ts';
import { createApp } from '../src/app.ts';

async function makeAppWithUser() {
  const db = createDb(':memory:');
  const app = createApp(db);

  const reg = await request(app).post('/auth/register').send({
    email: 'test@example.com',
    password: 'password123',
    name: 'Tester',
  });

  return { app, token: reg.body.token as string, userId: reg.body.user.id as number };
}

describe('GET /notes', () => {
  it('returns an empty array for a new user', async () => {
    const { app, token } = await makeAppWithUser();
    const res = await request(app)
      .get('/notes')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, []);
  });

  it('returns notes belonging to the authenticated user', async () => {
    const { app, token } = await makeAppWithUser();

    await request(app)
      .post('/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'My First Note', content: 'Hello world' });

    const res = await request(app)
      .get('/notes')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].title, 'My First Note');
  });

  it('returns 401 without a token', async () => {
    const { app } = await makeAppWithUser();
    const res = await request(app).get('/notes');
    assert.equal(res.status, 401);
  });
});

describe('POST /notes', () => {
  it('creates a note and returns it', async () => {
    const { app, token } = await makeAppWithUser();
    const res = await request(app)
      .post('/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Meeting Notes', content: 'Discussed Q2 roadmap', tags: ['work'] });

    assert.equal(res.status, 201);
    assert.equal(res.body.title, 'Meeting Notes');
    assert.equal(res.body.content, 'Discussed Q2 roadmap');
    assert.ok(res.body.id, 'should have an id');
  });
});

describe('PATCH /notes/:id', () => {
  it('updates an existing note', async () => {
    const { app, token } = await makeAppWithUser();

    const create = await request(app)
      .post('/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Draft', content: 'Initial content' });

    const noteId = create.body.id;

    const res = await request(app)
      .patch(`/notes/${noteId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Final', content: 'Revised content' });

    assert.equal(res.status, 200);
    assert.equal(res.body.title, 'Final');
    assert.equal(res.body.content, 'Revised content');
  });

  it('returns 404 for a note the user does not own', async () => {
    const { app, token } = await makeAppWithUser();

    const res = await request(app)
      .patch('/notes/9999')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Hacked' });

    assert.equal(res.status, 404);
  });
});

describe('DELETE /notes/:id', () => {
  it('deletes an existing note', async () => {
    const { app, token } = await makeAppWithUser();

    const create = await request(app)
      .post('/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'To Delete' });

    const noteId = create.body.id;
    const res = await request(app)
      .delete(`/notes/${noteId}`)
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { success: true });
  });

  it('returns 401 without a token', async () => {
    const { app, token } = await makeAppWithUser();

    const create = await request(app)
      .post('/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'To Delete' });

    const noteId = create.body.id;
    const res = await request(app).delete(`/notes/${noteId}`);

    assert.equal(res.status, 401);
  });

  it('returns 404 when deleting a note owned by another user', async () => {
    const { app, token } = await makeAppWithUser();

    const create = await request(app)
      .post('/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Owned Note' });

    const noteId = create.body.id;

    const other = await request(app).post('/auth/register').send({
      email: 'other@example.com',
      password: 'password123',
      name: 'Other',
    });
    const otherToken = other.body.token as string;

    const res = await request(app)
      .delete(`/notes/${noteId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    assert.equal(res.status, 404);
  });
});

describe('GET /notes/search', () => {
  it('returns notes matching the query', async () => {
    const { app, token } = await makeAppWithUser();

    await request(app)
      .post('/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'TypeScript tips', content: 'Use strict mode' });

    await request(app)
      .post('/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Grocery list', content: 'Milk, eggs, bread' });

    const res = await request(app)
      .get('/notes/search?q=TypeScript')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].title, 'TypeScript tips');
  });

  it('returns 400 when q is missing', async () => {
    const { app, token } = await makeAppWithUser();
    const res = await request(app)
      .get('/notes/search')
      .set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 400);
  });
});
