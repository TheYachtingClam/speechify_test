const API_URL = 'http://localhost:3000';

function authHeaders(token: string) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

export async function register(email: string, password: string, name: string) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function getNotes(token: string) {
  const res = await fetch(`${API_URL}/notes`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error('Failed to fetch notes');
  return res.json();
}

export async function createNote(token: string, title: string, content: string, tags: string[]) {
  const res = await fetch(`${API_URL}/notes`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ title, content, tags }),
  });
  if (!res.ok) throw new Error('Failed to create note');
  return res.json();
}

export async function updateNote(token: string, id: number, patch: Partial<{ title: string; content: string; tags: string[] }>) {
  const res = await fetch(`${API_URL}/notes/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error('Failed to update note');
  return res.json();
}

export async function deleteNote(token: string, id: number) {
  const res = await fetch(`${API_URL}/notes/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to delete note');
  return res.json();
}

export async function searchNotes(token: string, q: string) {
  const res = await fetch(`${API_URL}/notes/search?q=${q}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}
