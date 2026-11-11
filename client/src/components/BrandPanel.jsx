import { Link } from 'react-router-dom';

// Panneau vert de gauche, commun aux pages d'authentification
export default function BrandPanel() {
  return (
    <section className="lp-panneau">
      <svg className="lp-cercles" aria-hidden="true" width="900" height="900" viewBox="0 0 900 900">
        <circle cx="450" cy="450" r="440" fill="none" stroke="#2FBF71" strokeWidth="2" />
        <circle cx="450" cy="450" r="340" fill="none" stroke="#2FBF71" strokeWidth="2" />
        <circle cx="450" cy="450" r="240" fill="none" stroke="#2FBF71" strokeWidth="2" />
      </svg>

      <div className="lp-marque">
        <svg width="64" height="64" viewBox="0 0 200 200" role="img" aria-label="BREECE SHARK">
          <path d="M88 77 C92 58 105 45 120 40 C115 54 115 66 119 77 Z" fill="#2FBF71" />
          <path d="M172 106 C167 84 137 71 102 73 C72 75 52 85 40 97 L20 76 C25 94 25 110 20 130 L40 112 C54 126 77 136 107 136 C142 136 170 124 172 106 Z" fill="#2FBF71" />
          <path d="M58 117 C80 131 110 135 140 131 C156 129 166 121 171 110 C150 121 100 125 58 117 Z" fill="#E6FBEF" />
          <path d="M96 127 C93 141 85 151 75 156 C89 154 105 146 115 133 Z" fill="#2FBF71" />
          <circle cx="141" cy="94" r="6.5" fill="#0B3D2C" />
          <circle cx="143.5" cy="91.5" r="2.2" fill="#FFFFFF" />
          <path d="M130 109 Q147 123 164 106" fill="none" stroke="#0B3D2C" strokeWidth="4" strokeLinecap="round" />
        </svg>
        <div className="lp-marque-nom">BREECE <span className="lp-accent">SHARK</span></div>
      </div>

      <div className="lp-intro">
        <h1>Bienvenue sur<br /><span className="lp-accent">votre CRM.</span></h1>
        <p>Toutes les personnes que vous rencontrez, le contexte de chaque relation et l'évolution de votre réseau, réunis dans un seul outil.</p>
        <ul className="lp-atouts">
          <li>
            <span className="lp-icone">
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2FBF71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="4" /><path d="M2 21c0-4 3-7 7-7s7 3 7 7" /><path d="M17 11a3 3 0 1 0 0-6" /><path d="M22 21c0-3-2-5.5-5-6" /></svg>
            </span>
            Fiches contacts centralisées, recherche et filtres
          </li>
          <li>
            <span className="lp-icone">
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2FBF71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="5" height="16" rx="1.5" /><rect x="10" y="4" width="5" height="11" rx="1.5" /><rect x="17" y="4" width="4" height="7" rx="1.5" /></svg>
            </span>
            Statistiques visuelles de votre réseau
          </li>
          <li>
            <span className="lp-icone">
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2FBF71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
            </span>
            Les contacts à recontacter toujours en vue
          </li>
        </ul>
      </div>

      <div className="lp-pied">© BREECE SHARK · CRM personnel · <Link to="/confidentialite">Confidentialité</Link></div>
    </section>
  );
}