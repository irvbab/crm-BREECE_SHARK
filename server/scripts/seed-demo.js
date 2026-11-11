// Crée (ou recrée) le compte de démo avec 20 contacts variés.
// Usage (depuis le dossier server) : node scripts/seed-demo.js MotDePasse1
import 'dotenv/config';
import dns from 'node:dns';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/user.js';
import Contact from '../src/models/contact.js';

dns.setServers(['8.8.8.8', '1.1.1.1']); // même astuce DNS que le serveur en local

const EMAIL = 'demo@example.com';
const PASSWORD = process.argv[2];

if (!PASSWORD || PASSWORD.length < 8 || !/[0-9]/.test(PASSWORD) || !/[A-Z]/.test(PASSWORD)) {
  console.error('Usage : node scripts/seed-demo.js MotDePasse1  (8 caractères, 1 chiffre, 1 majuscule)');
  process.exit(1);
}

// Contacts fictifs. monthsAgo = il y a combien de mois le contact a été ajouté.
const CONTACTS = [
  { firstName: 'Marie', lastName: 'Dupont', company: 'Acme', jobTitle: 'Directrice marketing', category: 'Pro', status: 'actif', metPlace: 'Salon VivaTech', metAt: '2026-06-12', email: 'marie.dupont@example.com', phone: '+33639980011', socialNetwork: 'LinkedIn', photoUrl: 'https://i.pravatar.cc/150?img=47', notes: 'Intéressée par un partenariat sur le prochain salon.', monthsAgo: 5 },
  { firstName: 'Lucas', lastName: 'Martin', company: 'Startup Lab', jobTitle: 'CEO', category: 'Réseau', status: 'à recontacter', metPlace: 'Station F', metAt: '2026-06-20', email: 'lucas.martin@example.com', socialNetwork: 'LinkedIn', notes: 'Lève des fonds en janvier. Le relancer début décembre.', monthsAgo: 5 },
  { firstName: 'Sophie', lastName: 'Bernard', jobTitle: 'Photographe', category: 'Perso', status: 'actif', metPlace: 'Paris', metAt: '2026-05-03', socialNetwork: 'Instagram', photoUrl: 'https://i.pravatar.cc/150?img=45', notes: 'Amie de longue date. Fait de superbes portraits.', monthsAgo: 5 },
  { firstName: 'Karim', lastName: 'Haddad', company: 'BNP Paribas', jobTitle: 'Analyste', category: 'Pro', status: 'inactif', metPlace: 'Salon VivaTech', metAt: '2026-06-13', email: 'karim.haddad@example.com', photoUrl: 'https://i.pravatar.cc/150?img=12', monthsAgo: 4 },
  { firstName: 'Li', lastName: 'Wei', company: 'Baidu', jobTitle: 'Ingénieur IA', category: 'Réseau', status: 'actif', metPlace: 'Shanghai', metAt: '2026-07-08', email: 'li.wei@example.com', socialNetwork: 'LinkedIn', notes: 'Spécialiste des modèles de langage.', monthsAgo: 4 },
  { firstName: 'Ji-woo', lastName: 'Park', company: 'Samsung', jobTitle: 'Product Manager', category: 'Pro', status: 'à recontacter', metPlace: 'Séoul', metAt: '2026-07-15', email: 'jiwoo.park@example.com', notes: 'Attend une proposition commerciale.', monthsAgo: 4 },
  { firstName: 'Emma', lastName: 'Leroy', company: 'Doctolib', jobTitle: 'UX Designer', category: 'Réseau', status: 'actif', metPlace: 'Station F', metAt: '2026-08-02', socialNetwork: 'LinkedIn', photoUrl: 'https://i.pravatar.cc/150?img=44', monthsAgo: 3 },
  { firstName: 'Thomas', lastName: 'Moreau', company: 'Capgemini', jobTitle: 'Consultant cloud', category: 'Pro', status: 'actif', metPlace: 'AWS Summit Paris', metAt: '2026-08-21', email: 'thomas.moreau@example.com', phone: '+12025550134', monthsAgo: 3 },
  { firstName: 'Julie', lastName: 'Petit', jobTitle: 'Professeure', category: 'Perso', status: 'actif', metPlace: 'Lyon', metAt: '2026-08-10', notes: 'Cousine de Thomas.', monthsAgo: 3 },
  { firstName: 'Omar', lastName: 'Al-Farsi', company: 'Emirates', jobTitle: 'Directeur des achats', category: 'Pro', status: 'à recontacter', metPlace: 'Dubaï', metAt: '2026-09-05', email: 'omar.alfarsi@example.com', phone: '+12025550178', notes: 'Rappeler pour le contrat 2027.', monthsAgo: 2 },
  { firstName: 'Camille', lastName: 'Roux', company: 'Ubisoft', jobTitle: 'Game Designer', category: 'Réseau', status: 'actif', metPlace: 'Salon VivaTech', metAt: '2026-06-14', socialNetwork: 'X', photoUrl: 'https://i.pravatar.cc/150?img=32', monthsAgo: 2 },
  { firstName: 'Hugo', lastName: 'Fournier', company: 'Qonto', jobTitle: 'Développeur', category: 'Réseau', status: 'inactif', metPlace: 'Afterwork Paris Tech', metAt: '2026-09-18', monthsAgo: 2 },
  { firstName: 'Léa', lastName: 'Girard', company: 'L\'Oréal', jobTitle: 'Cheffe de projet', category: 'Pro', status: 'actif', metPlace: 'Paris', metAt: '2026-09-25', email: 'lea.girard@example.com', photoUrl: 'https://i.pravatar.cc/150?img=49', monthsAgo: 1 },
  { firstName: 'James', lastName: 'Carter', company: 'Google', jobTitle: 'Cloud Architect', category: 'Pro', status: 'actif', metPlace: 'Londres', metAt: '2026-10-02', email: 'james.carter@example.com', phone: '+12025550123', socialNetwork: 'LinkedIn', monthsAgo: 1 },
  { firstName: 'Nina', lastName: 'Lambert', jobTitle: 'Architecte', category: 'Perso', status: 'actif', metPlace: 'Lyon', metAt: '2026-10-10', socialNetwork: 'Instagram', monthsAgo: 1 },
  { firstName: 'Antoine', lastName: 'Bonnet', company: 'Station F', jobTitle: 'Responsable incubateur', category: 'Réseau', status: 'à recontacter', metPlace: 'Station F', metAt: '2026-10-15', email: 'antoine.bonnet@example.com', notes: 'Peut présenter Breece à des investisseurs.', monthsAgo: 1 },
  { firstName: 'Sarah', lastName: 'Cohen', company: 'Alan', jobTitle: 'Head of Sales', category: 'Pro', status: 'actif', metPlace: 'AWS Summit Paris', metAt: '2026-10-22', photoUrl: 'https://i.pravatar.cc/150?img=5', monthsAgo: 0 },
  { firstName: 'Mehdi', lastName: 'Benali', company: 'OVHcloud', jobTitle: 'Ingénieur cybersécurité', category: 'Pro', status: 'actif', metPlace: 'Salon VivaTech', metAt: '2026-06-12', email: 'mehdi.benali@example.com', phone: '+33639980027', monthsAgo: 0 },
  { firstName: 'Clara', lastName: 'Fontaine', jobTitle: 'Étudiante en design', category: 'Perso', status: 'inactif', metPlace: 'Paris', metAt: '2026-11-02', monthsAgo: 0 },
  { firstName: 'Yasmine', lastName: 'Diallo', company: 'Back Market', jobTitle: 'Data Scientist', category: 'Réseau', status: 'actif', metPlace: 'Afterwork Paris Tech', metAt: '2026-11-05', socialNetwork: 'LinkedIn', photoUrl: 'https://i.pravatar.cc/150?img=20', monthsAgo: 0 },
];

await mongoose.connect(process.env.MONGODB_URI);

// Crée le compte, ou le réinitialise s'il existe déjà
const hash = await bcrypt.hash(PASSWORD, 12);
let user = await User.findOne({ email: EMAIL });
if (user) {
  await Contact.deleteMany({ userId: user._id });
  user.password = hash;
  await user.save();
} else {
  user = await User.create({ name: 'Breece Shark', email: EMAIL, password: hash });
}

// Prépare les contacts avec des dates d'ajout étalées dans le passé
const now = new Date();
const docs = CONTACTS.map(({ monthsAgo, metAt, ...c }) => {
  const created = new Date(now);
  created.setMonth(created.getMonth() - monthsAgo);
  return { ...c, metAt: new Date(metAt), userId: user._id, createdAt: created, updatedAt: created, __v: 0 };
});

// Insertion directe dans MongoDB, pour pouvoir choisir nous-mêmes createdAt
await Contact.collection.insertMany(docs);

console.log(` Compte de démo prêt : ${EMAIL} (${docs.length} contacts)`);
await mongoose.disconnect();