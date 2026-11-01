import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [params] = useSearchParams();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await api('/auth/login', { method: 'POST', body: { email, password } });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>Connexion</h1>
      {params.get('error') === 'google' && <p>La connexion Google a échoué.</p>}
      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email}
               onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Mot de passe" value={password}
               onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Se connecter</button>
      </form>

      <a href="/api/auth/google">Se connecter avec Google</a>
    </div>
  );
}