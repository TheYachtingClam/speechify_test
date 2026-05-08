import { useState } from 'react';
import { login, register } from './api';
import NoteList from './components/NoteList';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const result = mode === 'login'
        ? await login(email, password)
        : await register(email, password, name);
      localStorage.setItem('token', result.token);
      setToken(result.token);
    } catch (err: any) {
      setError(err.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    setToken(null);
  }

  if (token) {
    return <NoteList token={token} onLogout={handleLogout} />;
  }

  return (
    <main style={{ maxWidth: 400, margin: '80px auto', fontFamily: 'sans-serif' }}>
      <h1>NotesApp</h1>
      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ display: 'block', width: '100%', marginBottom: 8 }}
          />
        )}
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: 8 }}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: 8 }}
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">{mode === 'login' ? 'Log in' : 'Register'}</button>
        <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} style={{ marginLeft: 8 }}>
          {mode === 'login' ? 'Create account' : 'Back to login'}
        </button>
      </form>
    </main>
  );
}
