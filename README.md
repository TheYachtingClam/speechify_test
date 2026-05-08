# NotesApp

A full-stack note-taking application. Users can register, log in, and manage personal notes with search and tagging support.

## Stack

- **API**: Node.js + Express + TypeScript + SQLite (better-sqlite3)
- **Web**: React + Vite + TypeScript
- **Monorepo**: pnpm workspaces

## Getting Started

### Prerequisites

- Node.js v22+
- pnpm (latest stable)

### Install dependencies

```bash
pnpm install
```

### Run the API

```bash
cd packages/api
pnpm dev
```

API runs on `http://localhost:3000`.

### Run the web app

```bash
cd packages/web
pnpm dev
```

Web app runs on `http://localhost:5173`.

### Run tests

```bash
pnpm test
# or for a single package:
cd packages/api && pnpm test
```

## API Reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | No | Register a new user |
| POST | /auth/login | No | Log in |
| GET | /notes | Yes | List your notes |
| POST | /notes | Yes | Create a note |
| PATCH | /notes/:id | Yes | Update a note |
| DELETE | /notes/:id | Yes | Delete a note |
| GET | /notes/search?q= | Yes | Search notes |

## Commit Convention

Each fix should be a separate atomic commit:

```
fix(scope): short description

Issue: what the problem is and why it matters.
Fix: what you changed and why this is the right approach.
Impact: severity — how it could be exploited or triggered.
```
