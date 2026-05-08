import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createDb } from '../src/db.ts';
import { createApp } from '../src/app.ts';

function makeApp() {
  const db = createDb(':memory:');
  return createApp(db);
}

describe('POST /auth/register', () => {
  it('registers a new user and returns a token', async () => {
    const app = makeApp();
    const res = await request(app).post('/auth/register').send({
      email: 'alice@example.com',
      password: 'hunter2',
      name: 'Alice',
    });

    assert.equal(res.status, 201);
    assert.ok(res.body.token, 'should return a token');
    assert.equal(res.body.user.email, 'alice@example.com');
    assert.equal(res.body.user.name, 'Alice');
  });

  it('returns 409 when email is already registered', async () => {
    const app = makeApp();
    const payload = { email: 'bob@example.com', password: 'pass', name: 'Bob' };

    await request(app).post('/auth/register').send(payload);
    const res = await request(app).post('/auth/register').send(payload);

    assert.equal(res.status, 409);
  });

  it('returns 400 when required fields are missing', async () => {
    const app = makeApp();
    const res = await request(app).post('/auth/register').send({ email: 'x@x.com' });
    assert.equal(res.status, 400);
  });
});

describe('POST /auth/login', () => {
  it('returns a token for valid credentials', async () => {
    const app = makeApp();
    await request(app).post('/auth/register').send({
      email: 'carol@example.com',
      password: 'secret',
      name: 'Carol',
    });

    const res = await request(app).post('/auth/login').send({
      email: 'carol@example.com',
      password: 'secret',
    });

    assert.equal(res.status, 200);
    assert.ok(res.body.token, 'should return a token');
  });

  it('returns 401 for wrong password', async () => {
    const app = makeApp();
    await request(app).post('/auth/register').send({
      email: 'dave@example.com',
      password: 'correct',
      name: 'Dave',
    });

    const res = await request(app).post('/auth/login').send({
      email: 'dave@example.com',
      password: 'wrong',
    });

    assert.equal(res.status, 401);
  });

  it('returns 401 for unknown email', async () => {
    const app = makeApp();
    const res = await request(app).post('/auth/login').send({
      email: 'nobody@example.com',
      password: 'x',
    });
    assert.equal(res.status, 401);
  });
});
