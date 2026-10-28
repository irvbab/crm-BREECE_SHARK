import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());                                                  // en-têtes de sécurité HTTP
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true })); // seul ton front peut appeler l'API
app.use(express.json({ limit: '10kb' }));                           // refuse les requêtes trop lourdes
app.use(cookieParser());
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 })); // 100 requêtes / 15 min par IP
app.use('/api/auth', authRoutes);

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(' Connecté à MongoDB');
    app.listen(PORT, () => console.log(` Serveur sur http://localhost:${PORT}`));
  } catch (err) {
    console.error(' Erreur MongoDB :', err.message);
    process.exit(1);
  }
}

start();