import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';

const STATUS = {
  'actif': { label: 'Actif', className: 'status-actif' },
  'inactif': { label: 'Inactif', className: 'status-inactif' },
  'à recontacter': { label: 'À recontacter', className: 'status-recontacter' },
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api('/auth/me').then(setUser);
  }, []);

  // Recharge la liste quand la recherche ou un filtre change (300 ms après la dernière frappe)
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (category) params.set('category', category);
      if (status) params.set('status', status);

      setLoading(true);
      api(`/contacts?${params}`)
        .then(setContacts)
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [q, category, status]);

  async function logout() {
    await api('/auth/logout', { method: 'POST' });
    navigate('/login');
  }

  return (
    <div className="app">
      <header className="app-header">
        <Link to="/dashboard" className="header-logo">
          <img src="/logo.png" alt="Breece Shark CRM" />
        </Link>
        <div className="header-right">
          <span>{user?.name}</span>
          <Link to="/stats">Statistiques</Link>
          <Link to="/account">Mon compte</Link>
          <Link to="/contacts/new" className="btn">+ Ajouter</Link>
          <button className="btn-secondary" onClick={logout}>Se déconnecter</button>
        </div>
      </header>

      <div className="toolbar">
        <input type="search" placeholder="Rechercher par nom ou prénom…" value={q}
               onChange={(e) => setQ(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Toutes les catégories</option>
          <option value="Pro">Pro</option>
          <option value="Perso">Perso</option>
          <option value="Réseau">Réseau</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="actif">Actif</option>
          <option value="inactif">Inactif</option>
          <option value="à recontacter">À recontacter</option>
        </select>
      </div>

      {loading ? (
        <p>Chargement…</p>
      ) : contacts.length === 0 ? (
        <p className="empty">Aucun contact trouvé.</p>
      ) : (
        <ul className="contact-list">
          {contacts.map((c) => (
            <li key={c._id}>
              <Link to={`/contacts/${c._id}`} className="contact-card">
                {c.photoUrl ? (
                  <img src={c.photoUrl} alt="" className="avatar" />
                ) : (
                  <div className="avatar">{c.firstName[0]}{c.lastName[0]}</div>
                )}
                <div className="contact-info">
                  <strong>{c.firstName} {c.lastName}</strong>
                  <span>{[c.jobTitle, c.company].filter(Boolean).join(' · ')}</span>
                </div>
                <span className="badge">{c.category}</span>
                <span className={`badge ${STATUS[c.status]?.className}`}>{STATUS[c.status]?.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}