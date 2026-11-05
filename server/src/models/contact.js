import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    photoUrl: { type: String, trim: true },
    metAt: { type: Date },                       // date de rencontre
    metPlace: { type: String, trim: true },      // lieu de rencontre
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    jobTitle: { type: String, trim: true },      // poste occupé
    socialNetwork: { type: String, trim: true }, // ex : LinkedIn, Instagram
    socialUrl: { type: String, trim: true },
    category: { type: String, enum: ['Pro', 'Perso', 'Réseau'], default: 'Pro' },
    notes: { type: String, maxlength: 5000 },
    status: { type: String, enum: ['actif', 'inactif', 'à recontacter'], default: 'actif' },
  },
  { timestamps: true } // createdAt servira pour la stat « contacts ajoutés par mois »
);

export default mongoose.model('Contact', contactSchema);