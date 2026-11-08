import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';

const STATUS = {
  'actif': { label: 'Actif', className: 'status-actif' },
  'inactif': { label: 'Inactif', className: 'status-inactif' },
  'à recontacter': { label: 'À recontacter', className: 'status-recontacter' },
};

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('fr-FR') : '';
}

export default function ContactDetail() {
  const { id } = useParams();
  const [c, setC] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api(`/contacts/${id}`).then(setC).catch(() => navigate('/dashboard'));
  }, [id]);

  async function handleDelete() {
    if (!window.confirm(`Supprimer ${c.firstName} ${c.lastName} ? Cette action est définitive.`)) return;
    await api(`/contacts/${id}`, { method: 'DELETE' });
    navigate('/dashboard');
  }

  if (!c) return <div className="app"><p>Chargement…</p></div>;

  const rows = [
    ['Email', c.email],
    ['Téléphone', c.phone],
    ['Entreprise', c.company],
    ['Poste', c.jobTitle],
    ['Rencontré le', formatDate(c.metAt)],
    ['Lieu de rencontre', c.metPlace],
    ['Réseau social', c.socialNetwork],
  ];

  return (
    <div className="app">
      <header className="app-header">
        <Link to="/dashboard">← Retour aux contacts</Link>
      </header>

      <div className="detail-head">
        {c.photoUrl ? (
          <img src={c.photoUrl} alt="" className="avatar avatar-lg" />
        ) : (
          <div className="avatar avatar-lg">{c.firstName[0]}{c.lastName[0]}</div>
        )}
        <div>
          <h1>{c.firstName} {c.lastName}</h1>
          <div className="badges">
            <span className="badge">{c.category}</span>
            <span className={`badge ${STATUS[c.status]?.className}`}>{STATUS[c.status]?.label}</span>
          </div>
        </div>
      </div>

      <dl className="detail-list">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value || '—'}</dd>
          </div>
        ))}
        {c.socialUrl && (
          <div>
            <dt>Profil</dt>
            <dd><a href={c.socialUrl} target="_blank" rel="noopener noreferrer">Ouvrir le profil ↗</a></dd>
          </div>
        )}
      </dl>

      <h2 className="section-title">Notes</h2>
      <p className="notes">{c.notes || 'Aucune note pour ce contact.'}</p>

      <div className="actions">
        <Link to={`/contacts/${id}/edit`} className="btn">Modifier</Link>
        <button className="btn-danger" onClick={handleDelete}>Supprimer</button>
      </div>
    </div>
  );
}