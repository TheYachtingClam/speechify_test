import { useState, useEffect } from 'react';
import { getNotes, deleteNote, searchNotes } from '../api';
import NoteEditor from './NoteEditor';

interface Note {
  id: number;
  title: string;
  content: string;
  tags: string;
  created_at: string;
}

interface Props {
  token: string;
  onLogout: () => void;
}

export default function NoteList({ token, onLogout }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selected, setSelected] = useState<Note | null>(null);
  const [creating, setCreating] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const data = await getNotes(token);
    setNotes(data);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: number) {
    await deleteNote(token, id);
    load();
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQ) return load();
    const results = await searchNotes(token, searchQ);
    setNotes(results);
  }

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>My Notes</h1>
        <button onClick={onLogout}>Logout</button>
      </div>

      <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
        <input
          placeholder="Search notes..."
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          style={{ width: 260, marginRight: 8 }}
        />
        <button type="submit">Search</button>
        {searchQ && <button type="button" onClick={() => { setSearchQ(''); load(); }} style={{ marginLeft: 4 }}>Clear</button>}
      </form>

      <button onClick={() => { setCreating(true); setSelected(null); }} style={{ marginBottom: 16 }}>
        + New Note
      </button>

      {(creating || selected) && (
        <NoteEditor
          token={token}
          note={selected}
          onSave={() => { setCreating(false); setSelected(null); load(); }}
          onCancel={() => { setCreating(false); setSelected(null); }}
        />
      )}

      {notes.length === 0 && <p>No notes yet.</p>}
      {notes.map((note) => (
        <div key={note.id} style={{ border: '1px solid #ddd', borderRadius: 6, padding: 12, marginBottom: 10 }}>
          <h3 style={{ margin: '0 0 4px' }}>{note.title}</h3>
          <p style={{ margin: '0 0 8px', color: '#555', fontSize: 14 }}>
            {note.content.slice(0, 120)}{note.content.length > 120 ? '…' : ''}
          </p>
          <button onClick={() => { setSelected(note); setCreating(false); }} style={{ marginRight: 8 }}>Edit</button>
          <button onClick={() => handleDelete(note.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
