# Breece Shark CRM

CRM personnel accessible depuis n'importe quel navigateur. Il permet de centraliser toutes les personnes rencontrées, de garder le contexte de chaque relation et de suivre l'évolution de son réseau grâce à des statistiques visuelles.

Projet réalisé pour la JEECE (mission MP25 RTCi).

**Site en ligne :** https://crm-breece-shark-9z1v.vercel.app

---

## Fonctionnalités

### Authentification
- Inscription et connexion par email / mot de passe
- Connexion avec Google (OAuth 2.0)
- Mot de passe oublié : lien de réinitialisation envoyé par email, valable 30 minutes et utilisable une seule fois
- Option « Rester connecté »

### Contacts
- Fiche complète : nom, prénom, photo (lien), date et lieu de rencontre, email, téléphone international, entreprise, poste, réseau social principal, catégorie (Pro, Perso, Réseau), notes libres, statut (actif, inactif, à recontacter)
- Recherche par nom ou prénom, filtres par catégorie et par statut
- Ajout, modification et suppression

### Statistiques
- Chiffres clés (total, actifs, à recontacter, inactifs)
- Contacts par catégorie
- Contacts ajoutés par mois
- Répartition par lieu de rencontre
- Liste des contacts à recontacter

### RGPD (bonus)
- Export de toutes ses données au format JSON (droit à la portabilité, article 20)
- Suppression définitive du compte et de tous ses contacts (droit à l'oubli, article 17)
- Page « Politique de confidentialité »

---

## Stack technique

| Partie | Technologies |
|---|---|
| Front-end | React, Vite, React Router, Recharts, react-phone-number-input |
| Back-end | Node.js, Express, Mongoose |
| Base de données | MongoDB Atlas |
| Authentification | JWT en cookie httpOnly, bcrypt, Google OAuth (google-auth-library) |
| Emails | API Gmail |
| Hébergement | Vercel (front), Render (API), MongoDB Atlas (base) — offres gratuites |

---

## Sécurité

| Mesure | Mise en œuvre |
|---|---|
| Mots de passe | Hashés avec bcrypt (coût 12), règles : 8 caractères, 1 chiffre, 1 majuscule |
| Sessions | JWT signé, stocké dans un cookie `httpOnly`, `secure` en production, `sameSite=lax` |
| CORS | Seule l'adresse du front (`CLIENT_URL`) est autorisée |
| Rate limiting | 300 requêtes / 15 min sur l'API, 5 tentatives / 15 min sur les routes d'authentification |
| Validation | Toutes les entrées sont validées avec zod (protège aussi contre l'injection NoSQL) |
| En-têtes HTTP | helmet |
| Cloisonnement | Chaque requête sur les contacts est filtrée par l'utilisateur connecté |
| Liens | Seuls les liens `http(s)://` sont acceptés (photo, profil) |
| Secrets | Variables d'environnement, jamais versionnées (`.env` dans `.gitignore`) |
| HTTPS | Fourni par Vercel et Render |

---

## Structure du projet

```
crm-BREECE_SHARK/
├── client/                  # Front-end React
│   ├── public/              # logo.png
│   ├── src/
│   │   ├── components/      # ProtectedRoute
│   │   ├── pages/           # Login, Register, Dashboard, ContactForm, ContactDetail, Stats, Account, Privacy…
│   │   ├── api.js           # Fonction unique d'appel à l'API
│   │   ├── App.jsx          # Routes
│   │   └── index.css        # Style global
│   ├── vercel.json          # Redirige /api vers Render
│   └── vite.config.js       # Proxy /api vers localhost:5000 en local
└── server/                  # API Express
    ├── scripts/
    │   └── seed-demo.js     # Crée le compte de démo
    ├── src/
    │   ├── middleware/      # requireAuth (vérifie le JWT)
    │   ├── models/          # user.js, contact.js
    │   ├── routes/          # auth.js, contacts.js, stats.js, account.js
    │   ├── utils/           # sendEmail.js (API Gmail)
    │   └── index.js         # Point d'entrée
    └── .env.example         # Liste des variables d'environnement
```

---

## Installation en local

### Prérequis
- Node.js (version LTS)
- Un cluster MongoDB Atlas
- Un projet Google Cloud avec un ID client OAuth et l'API Gmail activée

### 1. Récupérer le projet
```bash
git clone https://github.com/irvbab/crm-BREECE_SHARK.git
cd crm-BREECE_SHARK
```

### 2. Le serveur
```bash
cd server
npm install
```
Copier `.env.example` en `.env`, puis remplir chaque valeur (voir le tableau ci-dessous).
```bash
npm run dev
```
Le serveur démarre sur http://localhost:5000.

### 3. Le front (dans un deuxième terminal)
```bash
cd client
npm install
npm run dev
```
Le site s'ouvre sur http://localhost:5173.

### 4. Compte de démo (optionnel)
Crée (ou remet à zéro) le compte `demo@example.com` avec 20 contacts fictifs :
```bash
cd server
node scripts/seed-demo.js MotDePasse1
```

---

## Variables d'environnement (serveur)

| Variable | Rôle |
|---|---|
| `MONGODB_URI` | Chaîne de connexion MongoDB Atlas |
| `PORT` | Port du serveur en local (5000) — inutile sur Render |
| `JWT_SECRET` | Clé secrète de signature des JWT (64 octets aléatoires) |
| `CLIENT_URL` | Adresse du front (`http://localhost:5173` en local, adresse Vercel en production) |
| `NODE_ENV` | `production` sur Render |
| `GOOGLE_CLIENT_ID` | ID client OAuth Google |
| `GOOGLE_CLIENT_SECRET` | Code secret du client OAuth Google |
| `GOOGLE_CALLBACK_URL` | `<CLIENT_URL>/api/auth/google/callback` en production, `http://localhost:5000/api/auth/google/callback` en local |
| `GMAIL_REFRESH_TOKEN` | Refresh token Gmail (scope `gmail.send`), généré avec OAuth Playground |
| `GMAIL_SENDER` | Adresse Gmail qui envoie les emails |

Pour générer un `JWT_SECRET` :
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Déploiement

### API sur Render
- Type : Web Service, offre gratuite, région Frankfurt
- Root Directory : `server`
- Build Command : `npm install`
- Start Command : `npm start`
- Variables d'environnement : toutes celles du tableau, sauf `PORT`, avec `NODE_ENV=production`

### Front sur Vercel
- Root Directory : `client`
- Framework : Vite
- `client/vercel.json` redirige les appels `/api/*` vers l'API Render : le front et l'API partagent ainsi le même domaine, ce qui simplifie le cookie de session et le CORS.

### Google Cloud
Dans l'ID client OAuth, ajouter l'adresse Vercel dans les **origines JavaScript autorisées** et `https://<adresse-vercel>/api/auth/google/callback` dans les **URI de redirection autorisés**. L'application doit être **publiée** (état « En production ») : en mode « Test », seuls les utilisateurs tests peuvent se connecter et le refresh token Gmail expire au bout de 7 jours.

### Mise à jour
Chaque `git push` sur `main` redéploie automatiquement Vercel et Render.

> L'offre gratuite de Render met le serveur en veille après 15 minutes d'inactivité : la première requête peut alors prendre jusqu'à 50 secondes.

---

## Routes de l'API

| Méthode | Route | Rôle |
|---|---|---|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/logout` | Déconnexion |
| GET | `/api/auth/me` | Utilisateur connecté |
| POST | `/api/auth/forgot-password` | Envoi du lien de réinitialisation |
| POST | `/api/auth/reset-password` | Nouveau mot de passe |
| GET | `/api/auth/google` | Connexion Google |
| GET | `/api/contacts?q=&category=&status=` | Liste filtrée des contacts |
| POST | `/api/contacts` | Ajouter un contact |
| GET | `/api/contacts/:id` | Un contact |
| PUT | `/api/contacts/:id` | Modifier un contact |
| DELETE | `/api/contacts/:id` | Supprimer un contact |
| GET | `/api/stats` | Statistiques |
| GET | `/api/account/export` | Export RGPD (JSON) |
| DELETE | `/api/account` | Suppression du compte (RGPD) |

Toutes les routes sauf l'inscription, la connexion, le mot de passe oublié et Google exigent d'être connecté.

---

## Auteur

Irvine Babeni-Lutumba — JEECE, Junior-Entreprise de l'ECE