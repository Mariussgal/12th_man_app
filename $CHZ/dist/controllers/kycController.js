"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectKyc = exports.validateKyc = exports.getAllKycs = exports.submitKyc = void 0;
const kycModel_1 = __importDefault(require("../models/kycModel"));
const clubModel_1 = __importDefault(require("../models/clubModel")); // On importe le modèle Club
// 1. Soumettre une nouvelle demande de KYC
const submitKyc = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clubWalletAddress, clubName, legalStatus, registrationNumber, address, representativeName, documentUrl, idCardUrl, affiliationNumber } = req.body;
        // Petite validation pour être sûr qu'on a tout ce qu'il faut
        if (!clubWalletAddress || !clubName || !legalStatus || !registrationNumber || !address || !representativeName || !documentUrl || !idCardUrl) {
            return res.status(400).json({ message: "Tous les champs obligatoires doivent être remplis." });
        }
        // On vérifie si un KYC pour ce wallet n'existe pas déjà
        const existingKyc = yield kycModel_1.default.findOne({ clubWalletAddress });
        if (existingKyc) {
            return res.status(409).json({ message: "Une demande de KYC existe déjà pour cette adresse de wallet." });
        }
        // On crée la nouvelle entrée KYC
        const newKyc = new kycModel_1.default(Object.assign(Object.assign({}, req.body), { status: 'pending' }));
        yield newKyc.save();
        // On peut aussi créer ou trouver le club associé pour être sûr qu'il existe
        // 'upsert: true' veut dire : si tu ne le trouves pas, crée-le.
        yield clubModel_1.default.findOneAndUpdate({ walletAddress: clubWalletAddress }, { clubName: clubName, walletAddress: clubWalletAddress }, { upsert: true, new: true });
        res.status(201).json({ message: 'Demande KYC soumise avec succès.', kyc: newKyc });
    }
    catch (error) {
        res.status(500).json({ message: 'Erreur serveur lors de la soumission du KYC.', error });
    }
});
exports.submitKyc = submitKyc;
// 2. Récupérer toutes les demandes KYC (Admin seulement)
const getAllKycs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const kycs = yield kycModel_1.default.find().sort({ createdAt: -1 }); // Tri par date, le plus récent en premier
        res.status(200).json(kycs);
    }
    catch (error) {
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des KYC.' });
    }
});
exports.getAllKycs = getAllKycs;
// 3. Valider un KYC (Admin seulement)
const validateKyc = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const kyc = yield kycModel_1.default.findById(id);
        if (!kyc) {
            return res.status(404).json({ message: 'KYC non trouvé.' });
        }
        // On met à jour le statut du KYC
        kyc.status = 'validated';
        kyc.rejectionReason = undefined; // On enlève la raison de rejet s'il y en avait une
        yield kyc.save();
        // On met à jour le profil du club correspondant
        yield clubModel_1.default.findOneAndUpdate({ walletAddress: kyc.clubWalletAddress }, { kycValidated: true });
        res.status(200).json({ message: 'KYC validé avec succès.', kyc });
    }
    catch (error) {
        res.status(500).json({ message: 'Erreur serveur lors de la validation du KYC.' });
    }
});
exports.validateKyc = validateKyc;
// 4. Rejeter un KYC (Admin seulement)
const rejectKyc = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { rejectionReason } = req.body;
        if (!rejectionReason) {
            return res.status(400).json({ message: 'La raison du rejet est obligatoire.' });
        }
        const kyc = yield kycModel_1.default.findById(id);
        if (!kyc) {
            return res.status(404).json({ message: 'KYC non trouvé.' });
        }
        // On met à jour le statut et la raison du rejet
        kyc.status = 'rejected';
        kyc.rejectionReason = rejectionReason;
        yield kyc.save();
        // On s'assure que le statut du club est bien 'non validé'
        yield clubModel_1.default.findOneAndUpdate({ walletAddress: kyc.clubWalletAddress }, { kycValidated: false });
        res.status(200).json({ message: 'KYC rejeté avec succès.', kyc });
    }
    catch (error) {
        res.status(500).json({ message: 'Erreur serveur lors du rejet du KYC.' });
    }
});
exports.rejectKyc = rejectKyc;
