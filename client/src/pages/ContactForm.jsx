import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PhoneInput, { isValidPhoneNumber, parsePhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { api } from '../api.js';

const EMPTY = {
  firstName: '', lastName: '', photoUrl: '', metAt: '', metPlace: '',
  email: '', phone: '', company: '', jobTitle: '',
  socialNetwork: '', socialUrl: '', category: 'Pro', status: 'actif', notes: '',
};

export default function ContactForm() {
  const { id } = useParams();       // présent seulement en modification
  const isEdit = Boolean(id);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // En modification : pré-remplit le formulaire
  useEffect(() => {
    if (!isEdit) return;
    api(`/contacts/${id}`)
      .then((c) => {
        // Les anciens numéros sans indicatif (ex. "07 44…") sont considérés comme français
        let phone = c.phone || '';
        if (phone && !phone.startsWith('+')) {
          try { phone = parsePhoneNumber(phone, 'FR')?.number || ''; } catch { phone = ''; }
        }
        setForm({ ...EMPTY, ...c, phone, metAt: c.metAt ? c.metAt.slice(0, 10) : '' });
      })
      .catch(() => navigate('/dashboard'));
  }, [id]);

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Vérifie le numéro avant d'envoyer
    if (form.phone && !isValidPhoneNumber(form.phone)) {
      setError('Numéro de téléphone invalide pour ce pays');
      return;
    }

    setSaving(true);
    // N'envoie que les champs du formulaire (pas _id, userId…)
    const body = Object.fromEntries(Object.keys(EMPTY).map((k) => [k, form[k] ?? '']));
    try {
      const saved = await api(isEdit ? `/contacts/${id}` : '/contacts', {
        method: isEdit ? 'PUT' : 'POST',
        body,
      });
      navigate(`/contacts/${saved._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>{isEdit ? 'Modifier le contact' : 'Nouveau contact'}</h1>
        <Link to={isEdit ? `/contacts/${id}` : '/dashboard'}>Annuler</Link>
      </header>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="form-grid">
        <label>Prénom *
          <input name="firstName" value={form.firstName} onChange={update} required />
        </label>
        <label>Nom *
          <input name="lastName" value={form.lastName} onChange={update} required />
        </label>
        <label>Email
          <input type="email" name="email" value={form.email} onChange={update} />
        </label>
        <label>Téléphone
          <PhoneInput
            international
            defaultCountry="FR"
            value={form.phone || undefined}
            onChange={(value) => setForm({ ...form, phone: value || '' })}
          />
        </label>
        <label>Entreprise
          <input name="company" value={form.company} onChange={update} />
        </label>
        <label>Poste occupé
          <input name="jobTitle" value={form.jobTitle} onChange={update} />
        </label>
        <label>Date de rencontre
          <input type="date" name="metAt" value={form.metAt} onChange={update} />
        </label>
        <label>Lieu de rencontre
          <input name="metPlace" value={form.metPlace} onChange={update} />
        </label>
        <label>Réseau social principal
          <select name="socialNetwork" value={form.socialNetwork} onChange={update}>
            <option value="">Aucun</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Instagram">Instagram</option>
            <option value="X">X (Twitter)</option>
            <option value="Facebook">Facebook</option>
            <option value="TikTok">TikTok</option>
            <option value="Autre">Autre</option>
          </select>
        </label>
        <label>Lien du profil
          <input type="url" name="socialUrl" placeholder="https://…" value={form.socialUrl} onChange={update} />
        </label>
        <label>Catégorie
          <select name="category" value={form.category} onChange={update}>
            <option value="Pro">Pro</option>
            <option value="Perso">Perso</option>
            <option value="Réseau">Réseau</option>
          </select>
        </label>
        <label>Statut de la relation
          <select name="status" value={form.status} onChange={update}>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
            <option value="à recontacter">À recontacter</option>
          </select>
        </label>
        <label className="full">Photo (lien vers une image, optionnel)
          <input type="url" name="photoUrl" placeholder="https://…" value={form.photoUrl} onChange={update} />
        </label>
        <label className="full">Notes
          <textarea name="notes" rows={5} value={form.notes} onChange={update} />
        </label>
        <button type="submit" className="full" disabled={saving}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </form>
    </div>
  );
}