import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function Account() {
  const [user, setUser] = useState(null);
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api('/auth/me').then(setUser);
  }, []);

  async function handleDelete(e) {
    e.preventDefault();
    if (!window.confirm('Dernière confirmation : supprimer définitivement ton compte et tous tes contacts ?')) return;

    setError('');
    setDeleting(true);
    try {
      await api('/account', { method: 'DELETE', body: { confirm } });
      navigate('/login');
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Mon compte</h1>
        <Link to="/dashboard">← Contacts</Link>
      </header>

      <h2 className="section-title">Mes informations</h2>
      <p>{user?.name} · {user?.email}</p>

      {/* Export des données */}
      <h2 className="section-title" style={{ marginTop: 32 }}>Exporter mes données</h2>
      <p>
        Télécharge un fichier contenant ton compte et tous tes contacts, dans un format
        lisible et réutilisable (JSON). C'est ton droit à la portabilité (RGPD, article 20).
      </p>
      <a href="/api/account/export" className="btn" style={{ marginTop: 12 }} download>
        Télécharger mes données
      </a>

      {/* Suppression du compte */}
      <div style={{ marginTop: 40, padding: 20, border: '1px solid #fecaca', borderRadius: 10, background: '#fef2f2' }}>
        <h2 className="section-title" style={{ color: '#b91c1c' }}>Supprimer mon compte</h2>
        <p>
          Ton compte et <strong>tous tes contacts</strong> seront effacés définitivement.
          Cette action est irréversible : pense à exporter tes données avant (RGPD, article 17).
        </p>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleDelete} style={{ marginTop: 16 }}>
          <label>
            Pour confirmer, tape <strong>SUPPRIMER</strong> :
            <input value={confirm} onChange={(e) => setConfirm(e.target.value)}
                   placeholder="SUPPRIMER" style={{ display: 'block', width: '100%', marginTop: 8 }} />
          </label>
          <button type="submit" className="btn-danger" disabled={confirm !== 'SUPPRIMER' || deleting}>
            {deleting ? 'Suppression…' : 'Supprimer définitivement mon compte'}
          </button>
        </form>
      </div>

      <p style={{ marginTop: 32 }}>
        <Link to="/confidentialite">Politique de confidentialité</Link>
      </p>
    </div>
  );
}