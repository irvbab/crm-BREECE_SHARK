import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Politique de confidentialité</h1>
        <Link to="/dashboard">← Retour</Link>
      </header>

      <h2 className="section-title">Responsable du traitement</h2>
      <p>Breece Shark, propriétaire de l'application. <em>(Coordonnées de contact à compléter.)</em></p>

      <h2 className="section-title" style={{ marginTop: 24 }}>Données collectées</h2>
      <p>
        <strong>Ton compte :</strong> nom, adresse email, mot de passe (stocké uniquement sous forme chiffrée
        avec bcrypt, jamais en clair) ou identifiant Google si tu te connectes avec Google.
      </p>
      <p>
        <strong>Tes contacts :</strong> les informations que tu saisis toi-même (nom, coordonnées, entreprise,
        lieu de rencontre, notes…).
      </p>

      <h2 className="section-title" style={{ marginTop: 24 }}>Pourquoi</h2>
      <p>
        Uniquement pour faire fonctionner ton CRM personnel. Aucune donnée n'est vendue, partagée
        à des fins publicitaires ou utilisée pour autre chose.
      </p>

      <h2 className="section-title" style={{ marginTop: 24 }}>Où sont stockées les données</h2>
      <p>
        Base de données MongoDB Atlas et serveur Render, situés à Francfort (Union européenne).
        Le site est hébergé par Vercel. Les emails de réinitialisation de mot de passe sont envoyés via Gmail.
      </p>

      <h2 className="section-title" style={{ marginTop: 24 }}>Cookies</h2>
      <p>
        Un seul cookie technique, indispensable pour rester connecté. Aucun cookie publicitaire
        ni de mesure d'audience n'est utilisé.
      </p>

      <h2 className="section-title" style={{ marginTop: 24 }}>Durée de conservation</h2>
      <p>Tant que ton compte existe. À sa suppression, toutes les données sont effacées immédiatement.</p>

      <h2 className="section-title" style={{ marginTop: 24 }}>Tes droits</h2>
      <p>
        Tu peux à tout moment consulter et modifier tes données, les <strong>exporter</strong> ou
        <strong> supprimer ton compte</strong> depuis la page <Link to="/account">Mon compte</Link>.
        Les personnes enregistrées comme contacts peuvent demander au propriétaire du compte la
        modification ou la suppression de leurs informations. Tu peux aussi adresser une réclamation
        à la CNIL (cnil.fr).
      </p>
    </div>
  );
}