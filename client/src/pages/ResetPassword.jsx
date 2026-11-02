import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('Les mots de passe ne correspondent pas');
    try {
      const data = await api('/auth/reset-password', { method: 'POST', body: { token, password } });
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>Nouveau mot de passe</h1>
      {message ? (
        <p>{message} <Link to="/login">Se connecter</Link></p>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <p>{error}</p>}
          <input type="password" placeholder="Nouveau mot de passe" value={password}
                 onChange={(e) => setPassword(e.target.value)} minLength={8} required />
          <input type="password" placeholder="Confirme le mot de passe" value={confirm}
                 onChange={(e) => setConfirm(e.target.value)} minLength={8} required />
          <button type="submit">Changer le mot de passe</button>
        </form>
      )}
    </div>
  );
}