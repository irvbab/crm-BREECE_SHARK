import { Router } from 'express';
import { z } from 'zod';
import User from '../models/user.js';
import Contact from '../models/contact.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/account/export → toutes les données de l'utilisateur (RGPD art. 20 : portabilité)
router.get('/export', async (req, res) => {
  const user = await User.findById(req.userId).select('name email createdAt googleId').lean();
  if (!user) return res.status(401).json({ message: 'Utilisateur introuvable' });

  const contacts = await Contact.find({ userId: req.userId }).select('-userId -__v').lean();

  const data = {
    exportedAt: new Date().toISOString(),
    account: {
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      googleLinked: Boolean(user.googleId),
    },
    contactsCount: contacts.length,
    contacts,
  };

  // Le navigateur télécharge la réponse comme un fichier
  res.setHeader('Content-Disposition', 'attachment; filename="breece-shark-mes-donnees.json"');
  res.type('json').send(JSON.stringify(data, null, 2));
});

// L'utilisateur doit taper SUPPRIMER pour confirmer
const deleteSchema = z.object({ confirm: z.literal('SUPPRIMER') });

// DELETE /api/account → suppression définitive (RGPD art. 17 : droit à l'oubli)
router.delete('/', async (req, res) => {
  if (!deleteSchema.safeParse(req.body).success) {
    return res.status(400).json({ message: 'Tape SUPPRIMER en majuscules pour confirmer' });
  }

  await Contact.deleteMany({ userId: req.userId }); // d'abord tous ses contacts
  await User.findByIdAndDelete(req.userId);         // puis le compte

  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.json({ message: 'Compte et données supprimés définitivement' });
});

export default router;