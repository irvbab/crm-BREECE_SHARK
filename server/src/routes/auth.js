import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function sendToken(res, user) {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 8)
      return res.status(400).json({ message: 'Champs manquants ou mot de passe trop court (8 min)' });

    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(409).json({ message: 'Email déjà utilisé' });

    const user = await User.create({ name, email, password: await bcrypt.hash(password, 12) });
    sendToken(res, user);
    res.status(201).json({ id: user._id, name, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    if (!user || !user.password || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

    sendToken(res, user);
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).select('name email');
  if (!user) return res.status(401).json({ message: 'Utilisateur introuvable' });
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
