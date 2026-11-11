import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import BrandPanel from '../components/BrandPanel.jsx';
import './Login.css';
import './Register.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api('/auth/forgot-password', { method: 'POST', body: { email } });
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <BrandPanel />

      <main className="lp-zone-form">
        <form className="lp-form" onSubmit={handleSubmit}>
          <div className="lp-titre">
            <h2>Mot de passe oublié</h2>
            <p>Saisissez votre email : vous recevrez un lien pour choisir un nouveau mot de passe.</p>
          </div>

          {error && <div className="lp-erreur">{error}</div>}

          {message ? (
            // Confirmation après l'envoi
            <div className="lp-info">
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#13804A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
              <span>
                {message}. Le lien est valable <strong>30 minutes</strong>.
                Pensez à vérifier vos spams.
              </span>
            </div>
          ) : (
            <>
              <div className="lp-champ">
                <label htmlFor="email">Email</label>
                <input id="email" className="lp-input" type="email" placeholder="vous@exemple.com"
                       autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <button type="submit" className="lp-btn lp-btn-principal" disabled={loading}>
                {loading ? 'Envoi…' : 'Recevoir le lien'}
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>
              </button>
            </>
          )}

          <p className="lp-bas"><Link to="/login">← Retour à la connexion</Link></p>
        </form>
      </main>
    </div>
  );
}