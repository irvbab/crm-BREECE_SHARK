import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); 

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