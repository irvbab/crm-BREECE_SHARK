import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import BrandPanel from '../components/BrandPanel.jsx';
import './Login.css';
import './Register.css';

// Mêmes règles que l'inscription (vérifiées aussi par le serveur)
const RULES = [
  { key: 'longueur', label: '8 caractères', test: (v) => v.length >= 8 },
  { key: 'chiffre', label: '1 chiffre', test: (v) => /[0-9]/.test(v) },
  { key: 'majuscule', label: '1 majuscule', test: (v) => /[A-Z]/.test(v) },
];

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [loading, setLoading] = useState(false);

  const score = RULES.filter((r) => r.test(password)).length;
  const barColor = score === 3 ? '#2FBF71' : score === 2 ? '#E0A526' : '#D9534F';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setConfirmError('');

    if (score < 3) {
      setError('Le mot de passe doit contenir 8 caractères, 1 chiffre et 1 majuscule.');
      return;
    }
    if (password !== confirm) {
      setConfirmError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      const data = await api('/auth/reset-password', { method: 'POST', body: { token, password } });
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
        <form className="lp-form" onSubmit={handleSubmit} noValidate>
          <div className="lp-titre">
            <h2>Nouveau mot de passe</h2>
            <p>Choisissez un nouveau mot de passe pour votre compte.</p>
          </div>

          {!token && (
            <div className="lp-erreur">
              Lien incomplet. Refaites une demande depuis <Link to="/forgot-password">Mot de passe oublié</Link>.
            </div>
          )}
          {error && <div className="lp-erreur">{error}</div>}

          {message ? (
            // Succès : invite à se connecter
            <>
              <div className="lp-info">
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#13804A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
                <span>{message}</span>
              </div>
              <Link to="/login" className="lp-btn lp-btn-principal" style={{ textDecoration: 'none' }}>
                Se connecter
              </Link>
            </>
          ) : (
            <>
              <div className="lp-champ">
                <label htmlFor="motdepasse">Nouveau mot de passe</label>
                <div className="lp-mdp">
                  <input id="motdepasse" className="lp-input" type={showPassword ? 'text' : 'password'}
                         placeholder="8 caractères minimum" autoComplete="new-password"
                         value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <button type="button" className="lp-voir-mdp"
                          aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                          aria-pressed={showPassword}
                          onClick={() => setShowPassword(!showPassword)}>
                    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A6B5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
                  </button>
                </div>

                <div className="lp-force" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <span key={i} style={{ background: password && i < score ? barColor : undefined }} />
                  ))}
                </div>

                <ul className="lp-regles">
                  {RULES.map((r) => (
                    <li key={r.key} className={r.test(password) ? 'ok' : ''}>
                      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
                      {r.label}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lp-champ">
                <label htmlFor="confirmation">Confirmer le mot de passe</label>
                <input id="confirmation" className={`lp-input ${confirmError ? 'erreur' : ''}`}
                       type={showPassword ? 'text' : 'password'} placeholder="Retapez votre mot de passe"
                       autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
                {confirmError && <div className="lp-message-erreur" role="alert">{confirmError}</div>}
              </div>

              <button type="submit" className="lp-btn lp-btn-principal" disabled={loading || !token}>
                {loading ? 'Enregistrement…' : 'Changer le mot de passe'}
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
