import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api('/auth/login', { method: 'POST', body: { email, password, remember } });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      {/* ---------- Panneau de marque ---------- */}
      <section className="lp-panneau">
        <svg className="lp-cercles" aria-hidden="true" width="900" height="900" viewBox="0 0 900 900">
          <circle cx="450" cy="450" r="440" fill="none" stroke="#2FBF71" strokeWidth="2" />
          <circle cx="450" cy="450" r="340" fill="none" stroke="#2FBF71" strokeWidth="2" />
          <circle cx="450" cy="450" r="240" fill="none" stroke="#2FBF71" strokeWidth="2" />
        </svg>

        <div className="lp-marque">
          <svg width="64" height="64" viewBox="0 0 200 200" role="img" aria-label="BREECE SHARK">
            <path d="M88 77 C92 58 105 45 120 40 C115 54 115 66 119 77 Z" fill="#2FBF71" />
            <path d="M172 106 C167 84 137 71 102 73 C72 75 52 85 40 97 L20 76 C25 94 25 110 20 130 L40 112 C54 126 77 136 107 136 C142 136 170 124 172 106 Z" fill="#2FBF71" />
            <path d="M58 117 C80 131 110 135 140 131 C156 129 166 121 171 110 C150 121 100 125 58 117 Z" fill="#E6FBEF" />
            <path d="M96 127 C93 141 85 151 75 156 C89 154 105 146 115 133 Z" fill="#2FBF71" />
            <circle cx="141" cy="94" r="6.5" fill="#0B3D2C" />
            <circle cx="143.5" cy="91.5" r="2.2" fill="#FFFFFF" />
            <path d="M130 109 Q147 123 164 106" fill="none" stroke="#0B3D2C" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <div className="lp-marque-nom">BREECE <span className="lp-accent">SHARK</span></div>
        </div>

        <div className="lp-intro">
          <h1>Bienvenue sur<br /><span className="lp-accent">votre CRM.</span></h1>
          <p>Toutes les personnes que vous rencontrez, le contexte de chaque relation et l'évolution de votre réseau, réunis dans un seul outil.</p>
          <ul className="lp-atouts">
            <li>
              <span className="lp-icone">
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2FBF71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="4" /><path d="M2 21c0-4 3-7 7-7s7 3 7 7" /><path d="M17 11a3 3 0 1 0 0-6" /><path d="M22 21c0-3-2-5.5-5-6" /></svg>
              </span>
              Fiches contacts centralisées, recherche et filtres
            </li>
            <li>
              <span className="lp-icone">
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2FBF71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="5" height="16" rx="1.5" /><rect x="10" y="4" width="5" height="11" rx="1.5" /><rect x="17" y="4" width="4" height="7" rx="1.5" /></svg>
              </span>
              Statistiques visuelles de votre réseau
            </li>
            <li>
              <span className="lp-icone">
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2FBF71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
              </span>
              Les contacts à recontacter toujours en vue
            </li>
          </ul>
        </div>

                <div className="lp-pied">© BREECE SHARK · CRM personnel · <Link to="/confidentialite">Confidentialité</Link></div>
      </section>

      {/* ---------- Formulaire de connexion ---------- */}
      <main className="lp-zone-form">
        <form className="lp-form" onSubmit={handleSubmit}>
          <div className="lp-titre">
            <h2>Bon retour</h2>
            <p>Connectez-vous pour accéder à vos contacts.</p>
          </div>

          {params.get('error') === 'google' && <div className="lp-erreur">La connexion Google a échoué. Réessayez.</div>}
          {error && <div className="lp-erreur">{error}</div>}

          <a className="lp-btn lp-btn-google" href="/api/auth/google">
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" /></svg>
            Continuer avec Google
          </a>

          <div className="lp-separateur">ou avec votre email</div>

          <div className="lp-champ">
            <label htmlFor="email">Email</label>
            <input id="email" className="lp-input" type="email" placeholder="vous@exemple.com"
                   autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="lp-champ">
            <div className="lp-champ-entete">
              <label htmlFor="motdepasse">Mot de passe</label>
              <Link to="/forgot-password">Mot de passe oublié ?</Link>
            </div>
            <div className="lp-mdp">
              <input id="motdepasse" className="lp-input" type={showPassword ? 'text' : 'password'}
                     placeholder="••••••••" autoComplete="current-password"
                     value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" className="lp-voir-mdp"
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword(!showPassword)}>
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A6B5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
              </button>
            </div>
          </div>

          <label className="lp-souvenir">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Rester connecté
          </label>

          <button type="submit" className="lp-btn lp-btn-principal" disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>
          </button>

          <div className="lp-info">
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#13804A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
            <span>Pas encore de compte ? <Link to="/register">Créer un compte</Link>.</span>
          </div>
        </form>
      </main>
    </div>
  );
}