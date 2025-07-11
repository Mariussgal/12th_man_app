import { Router } from 'express';
import { submitKyc, getAllKycs, validateKyc, rejectKyc } from '../controllers/kycController';
import { isAdmin } from '../middlewares/isAdmin';

const router = Router();

// --- Route Publique pour les Clubs ---
// POST /api/kyc/submit : Un club soumet son formulaire
router.post('/submit', submitKyc);


// --- Routes Protégées pour l'Admin ---
// On applique le middleware 'isAdmin' à toutes les routes qui suivent

// GET /api/kyc/all : L'admin voit toutes les demandes
router.get('/all', isAdmin, getAllKycs);

// POST /api/kyc/:id/validate : L'admin valide une demande
router.post('/:id/validate', isAdmin, validateKyc);

// POST /api/kyc/:id/reject : L'admin rejette une demande
router.post('/:id/reject', isAdmin, rejectKyc);


export default router;