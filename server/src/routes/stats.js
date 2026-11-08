import { Router } from 'express';
import mongoose from 'mongoose';
import Contact from '../models/contact.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/stats → toutes les statistiques en une seule requête
router.get('/', async (req, res) => {
  // Dans une agrégation, Mongoose ne convertit pas l'id automatiquement
  const userId = new mongoose.Types.ObjectId(req.userId);

  const [result] = await Contact.aggregate([
    { $match: { userId } }, // uniquement SES contacts
    {
      $facet: {
        total: [{ $count: 'count' }],
        byCategory: [
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ],
        byMonth: [
          { $group: {
              _id: { $dateToString: { format: '%Y-%m', date: '$createdAt', timezone: 'Europe/Paris' } },
              count: { $sum: 1 },
          } },
          { $sort: { _id: 1 } },
        ],
        byPlace: [
          { $match: { metPlace: { $exists: true, $ne: '' } } },
          // Regroupe sans tenir compte des majuscules ni des espaces en trop
          { $group: {
              _id: { $toLower: { $trim: { input: '$metPlace' } } },
              name: { $first: '$metPlace' },
              count: { $sum: 1 },
          } },
          { $sort: { count: -1 } },
          { $limit: 8 },
        ],
        toRecontact: [
          { $match: { status: 'à recontacter' } },
          { $sort: { updatedAt: 1 } }, // les plus anciens en premier
          { $project: { firstName: 1, lastName: 1, company: 1 } },
          { $limit: 20 },
        ],
      },
    },
  ]);

  res.json({
    total: result.total[0]?.count || 0,
    byCategory: result.byCategory,
    byStatus: result.byStatus,
    byMonth: result.byMonth,
    byPlace: result.byPlace,
    toRecontact: result.toRecontact,
  });
});

export default router;