"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const kycController_1 = require("../controllers/kycController");
const isAdmin_1 = require("../middlewares/isAdmin");
const router = (0, express_1.Router)();
// --- Route Publique pour les Clubs ---
// POST /api/kyc/submit : Un club soumet son formulaire
router.post('/submit', kycController_1.submitKyc);
// --- Routes Protégées pour l'Admin ---
// On applique le middleware 'isAdmin' à toutes les routes qui suivent
// GET /api/kyc/all : L'admin voit toutes les demandes
router.get('/all', isAdmin_1.isAdmin, kycController_1.getAllKycs);
// POST /api/kyc/:id/validate : L'admin valide une demande
router.post('/:id/validate', isAdmin_1.isAdmin, kycController_1.validateKyc);
// POST /api/kyc/:id/reject : L'admin rejette une demande
router.post('/:id/reject', isAdmin_1.isAdmin, kycController_1.rejectKyc);
exports.default = router;
