import { useState } from 'react';
import { createNote, updateNote } from '../api';

interface Note {
  id: number;
  title: string;
  content: string;
  tags: string;
}

interface Props {
  token: string;
  note: Note | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function NoteEditor({ token, note, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    setError('');
    try {
      if (note) {
        await updateNote(token, note.id, { title, content });
      } else {
        await createNote(token, title, content, []);
      }
      onSave();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ border: '1px solid #aaa', borderRadius: 6, padding: 16, marginBottom: 16, background: '#fafafa' }}>
      <h3 style={{ marginTop: 0 }}>{note ? 'Edit Note' : 'New Note'}</h3>
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: 8, fontSize: 16 }}
      />
      <div style={{ marginBottom: 8 }}>
        <button type="button" onClick={() => setPreview(false)} style={{ marginRight: 4, fontWeight: !preview ? 'bold' : 'normal' }}>Edit</button>
        <button type="button" onClick={() => setPreview(true)} style={{ fontWeight: preview ? 'bold' : 'normal' }}>Preview</button>
      </div>
      {preview ? (
        <div
          style={{ minHeight: 120, border: '1px solid #ddd', borderRadius: 4, padding: 8 }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <textarea
          placeholder="Write your note here... (HTML supported in preview)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          style={{ display: 'block', width: '100%', marginBottom: 8, fontFamily: 'monospace', fontSize: 14 }}
        />
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleSave} style={{ marginRight: 8 }}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
}
