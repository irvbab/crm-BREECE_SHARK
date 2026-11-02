import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await api('/auth/forgot-password', { method: 'POST', body: { email } });
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>Mot de passe oublié</h1>
      {message ? (
        <p>{message}</p>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <p>{error}</p>}
          <input type="email" placeholder="Ton email" value={email}
                 onChange={(e) => setEmail(e.target.value)} required />
          <button type="submit">Recevoir le lien</button>
        </form>
      )}
      <p><Link to="/login">Retour à la connexion</Link></p>
    </div>
  );
}