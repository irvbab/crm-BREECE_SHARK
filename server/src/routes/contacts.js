import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import Contact from '../models/contact.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth); // toutes les routes contacts exigent d'être connecté

// Champ texte optionnel : accepte une chaîne vide
const optText = (max) => z.string().trim().max(max).optional();
// Une date vide ('') devient "pas de date"
const optDate = z.preprocess((v) => (v === '' || v === null ? undefined : v), z.coerce.date().optional());

const contactSchema = z.object({
  firstName: z.string().trim().min(1).max(50),
  lastName: z.string().trim().min(1).max(50),
  photoUrl: optText(500),
  metAt: optDate,
  metPlace: optText(100),
  email: z.string().trim().email().optional().or(z.literal('')),
  phone: optText(30),
  company: optText(100),
  jobTitle: optText(100),
  socialNetwork: optText(50),
  socialUrl: optText(500),
  category: z.enum(['Pro', 'Perso', 'Réseau']).optional(),
  notes: optText(5000),
  status: z.enum(['actif', 'inactif', 'à recontacter']).optional(),
});

// Empêche les caractères spéciaux de casser la recherche
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /api/contacts?q=...&category=...&status=...  → liste filtrée
router.get('/', async (req, res) => {
  const filter = { userId: req.userId };
  const { q, category, status } = req.query;

  if (typeof q === 'string' && q.trim()) {
    const regex = new RegExp(escapeRegex(q.trim()), 'i'); // 'i' = insensible à la casse
    filter.$or = [{ firstName: regex }, { lastName: regex }];
  }
  if (typeof category === 'string' && category) filter.category = category;
  if (typeof status === 'string' && status) filter.status = status;

  const contacts = await Contact.find(filter).sort({ lastName: 1, firstName: 1 });
  res.json(contacts);
});

// POST /api/contacts  → ajouter
router.post('/', async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Données invalides : prénom et nom obligatoires' });

  const contact = await Contact.create({ ...parsed.data, userId: req.userId });
  res.status(201).json(contact);
});

// GET /api/contacts/:id  → un contact
router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Contact introuvable' });

  const contact = await Contact.findOne({ _id: req.params.id, userId: req.userId });
  if (!contact) return res.status(404).json({ message: 'Contact introuvable' });
  res.json(contact);
});

// PUT /api/contacts/:id  → modifier
router.put('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Contact introuvable' });

  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Données invalides : prénom et nom obligatoires' });

  const contact = await Contact.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId }, // uniquement SES contacts
    parsed.data,
    { returnDocument: 'after', runValidators: true } // renvoie la version modifiée
  );
  if (!contact) return res.status(404).json({ message: 'Contact introuvable' });
  res.json(contact);
});

// DELETE /api/contacts/:id  → supprimer
router.delete('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Contact introuvable' });

  const contact = await Contact.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!contact) return res.status(404).json({ message: 'Contact introuvable' });
  res.json({ message: 'Contact supprimé' });
});

export default router;