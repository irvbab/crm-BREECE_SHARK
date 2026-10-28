import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import User from '../models/user.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Limite : 5 tentatives par 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: { message: 'Trop de tentatives, réessaie dans 15 minutes' },
});

// Schémas de validation
const registerSchema = z.object({
  name: z.string().trim().min(1).max(50),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(100),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(100),
});

// Crée le JWT et le place dans un cookie
function sendToken(res, user) {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}

// Inscription
router.post('/register', authLimiter, async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Nom, email valide et mot de passe de 8 caractères minimum requis' });
    }
    const { name, email, password } = parsed.data;

    if (await User.findOne({ email })) {
      return res.status(409).json({ message: 'Email déjà utilisé' });
    }

    const user = await User.create({ name, email, password: await bcrypt.hash(password, 12) });
    sendToken(res, user);
    res.status(201).json({ id: user._id, name, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Connexion
router.post('/login', authLimiter, async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }
    const { email, password } = parsed.data;

    const user = await User.findOne({ email });
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    sendToken(res, user);
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Utilisateur connecté (route protégée)
router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).select('name email');
  if (!user) {
    return res.status(401).json({ message: 'Utilisateur introuvable' });
  }
  res.json(user);
});

// Déconnexion : supprime le cookie
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.json({ message: 'Déconnecté' });
});

export default router;