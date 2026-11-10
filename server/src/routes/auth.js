import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import crypto from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/user.js';
import { requireAuth } from '../middleware/auth.js';
import { sendEmail } from '../utils/sendEmail.js';

const router = Router();

// Limite : 5 tentatives par 15 minutes en prod (100 en local)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === 'production' ? 5 : 100,
  message: { message: 'Trop de tentatives, réessaie dans 15 minutes' },
});

// ===== Schémas de validation =====

// Mot de passe : 8 caractères minimum, au moins 1 chiffre et 1 majuscule
const strongPassword = z.string().min(8).max(100).regex(/[0-9]/).regex(/[A-Z]/);

const registerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email(),
  password: strongPassword,
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(100), // pas de règle ici : les anciens mots de passe restent valides
  remember: z.boolean().optional(),
});

const forgotSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

const resetSchema = z.object({
  token: z.string().min(1),
  password: strongPassword,
});

// Crée le JWT et le place dans un cookie.
// remember = true → cookie gardé 7 jours ; sinon il disparaît à la fermeture du navigateur.
function sendToken(res, user, remember = true) {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    ...(remember ? { maxAge: 7 * 24 * 60 * 60 * 1000 } : {}),
  });
}

// ===== Inscription =====
router.post('/register', authLimiter, async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Nom, email valide et mot de passe de 8 caractères avec 1 chiffre et 1 majuscule requis' });
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

// ===== Connexion =====
router.post('/login', authLimiter, async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }
    const { email, password, remember } = parsed.data;

    const user = await User.findOne({ email });
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    sendToken(res, user, remember);
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ===== Utilisateur connecté (route protégée) =====
router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).select('name email');
  if (!user) {
    return res.status(401).json({ message: 'Utilisateur introuvable' });
  }
  res.json(user);
});

// ===== Déconnexion : supprime le cookie =====
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.json({ message: 'Déconnecté' });
});

// ===== Mot de passe oublié : envoie un lien par email =====
router.post('/forgot-password', authLimiter, async (req, res) => {
  // Même réponse dans tous les cas, pour ne pas révéler si un compte existe
  const genericMsg = { message: 'Si cet email existe, un lien de réinitialisation a été envoyé' };

  try {
    const parsed = forgotSchema.safeParse(req.body);
    if (!parsed.success) return res.json(genericMsg);

    const user = await User.findOne({ email: parsed.data.email });
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');                              // token envoyé par email
      user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex'); // version hashée en base
      user.resetPasswordExpires = Date.now() + 30 * 60 * 1000;                           // valable 30 minutes
      await user.save();

      const link = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
      await sendEmail({
        to: user.email,
        subject: 'Réinitialisation de ton mot de passe',
        html: `<p>Bonjour,</p>
               <p>Clique sur ce lien pour choisir un nouveau mot de passe (valable 30 minutes) :</p>
               <p><a href="${link}">${link}</a></p>
               <p>Si tu n'as rien demandé, ignore cet email.</p>`,
      });
    }

    res.json(genericMsg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ===== Réinitialisation : change le mot de passe si le token est valide =====
router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    const parsed = resetSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Lien invalide ou mot de passe trop faible (8 caractères, 1 chiffre, 1 majuscule)' });
    }

    const hashed = crypto.createHash('sha256').update(parsed.data.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: Date.now() }, // pas encore expiré
    });
    if (!user) {
      return res.status(400).json({ message: 'Lien invalide ou expiré' });
    }

    user.password = await bcrypt.hash(parsed.data.password, 12);
    user.resetPasswordToken = undefined;   // le lien ne marche qu'une fois
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Mot de passe modifié, tu peux te connecter' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ===== Connexion Google =====
function googleClient() {
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );
}

// Étape 1 : rediriger vers Google
router.get('/google', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex'); // protège contre les fausses redirections
  res.cookie('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000,
  });
  const url = googleClient().generateAuthUrl({
    scope: ['openid', 'email', 'profile'],
    state,
    prompt: 'select_account',
  });
  res.redirect(url);
});

// Étape 2 : Google revient ici avec un code
router.get('/google/callback', async (req, res) => {
  const errorUrl = `${process.env.CLIENT_URL}/login?error=google`;
  try {
    const { code, state } = req.query;
    if (!code || !state || state !== req.cookies.oauth_state) return res.redirect(errorUrl);
    res.clearCookie('oauth_state');

    const client = googleClient();
    const { tokens } = await client.getToken(code);
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub, email, name, email_verified } = ticket.getPayload();
    if (!email_verified) return res.redirect(errorUrl);

    // Compte Google existant, sinon compte email existant à rattacher, sinon nouveau compte
    let user = (await User.findOne({ googleId: sub })) || (await User.findOne({ email: email.toLowerCase() }));
    if (!user) {
      user = await User.create({ name: name || email, email, googleId: sub });
    } else if (!user.googleId) {
      user.googleId = sub;
      await user.save();
    }

    sendToken(res, user);
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  } catch (err) {
    console.error(err);
    res.redirect(errorUrl);
  }
});

export default router;