import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { api } from '../api.js';
import './Stats.css';

const COLORS = ['#16a34a', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6'];
const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

// "2026-11" → "nov. 26"
function monthLabel(key) {
  const [year, month] = key.split('-');
  return `${MONTHS[Number(month) - 1]} ${year.slice(2)}`;
}

export default function Stats() {
  const [s, setS] = useState(null);

  useEffect(() => {
    api('/stats').then(setS);
  }, []);

  if (!s) return <div className="app"><p>Chargement…</p></div>;

  const byCategory = s.byCategory.map((d) => ({ name: d._id, value: d.count }));
  const byMonth = s.byMonth.map((d) => ({ name: monthLabel(d._id), count: d.count }));
  const byPlace = s.byPlace.map((d) => ({ name: d.name, count: d.count }));
  const countStatus = (status) => s.byStatus.find((d) => d._id === status)?.count || 0;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Statistiques</h1>
        <Link to="/dashboard">← Contacts</Link>
      </header>

      {/* Chiffres clés */}
      <div className="kpis">
        <div className="kpi"><span>Contacts</span><strong>{s.total}</strong></div>
        <div className="kpi"><span>Actifs</span><strong>{countStatus('actif')}</strong></div>
        <div className="kpi"><span>À recontacter</span><strong>{countStatus('à recontacter')}</strong></div>
        <div className="kpi"><span>Inactifs</span><strong>{countStatus('inactif')}</strong></div>
      </div>

      {s.total === 0 ? (
        <p className="empty">Ajoute des contacts pour voir tes statistiques.</p>
      ) : (
        <div className="charts">
          {/* Par catégorie */}
          <section className="chart-card">
            <h2 className="section-title">Par catégorie</h2>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} label>
                  {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </section>

          {/* Ajoutés par mois */}
          <section className="chart-card">
            <h2 className="section-title">Contacts ajoutés par mois</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={byMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Contacts" fill="#16a34a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>

          {/* Par lieu de rencontre */}
          <section className="chart-card full">
            <h2 className="section-title">Par lieu de rencontre</h2>
            {byPlace.length === 0 ? (
              <p>Aucun lieu de rencontre renseigné.</p>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(160, byPlace.length * 40)}>
                <BarChart data={byPlace} layout="vertical">
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={140} />
                  <Tooltip />
                  <Bar dataKey="count" name="Contacts" fill="#0ea5e9" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </section>

          {/* À recontacter */}
          <section className="chart-card full">
            <h2 className="section-title">À recontacter</h2>
            {s.toRecontact.length === 0 ? (
              <p>Personne à recontacter pour l'instant.</p>
            ) : (
              <ul className="contact-list">
                {s.toRecontact.map((c) => (
                  <li key={c._id}>
                    <Link to={`/contacts/${c._id}`} className="contact-card">
                      <div className="avatar">{c.firstName[0]}{c.lastName[0]}</div>
                      <div className="contact-info">
                        <strong>{c.firstName} {c.lastName}</strong>
                        <span>{c.company}</span>
                      </div>
                      <span className="badge status-recontacter">À recontacter</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}