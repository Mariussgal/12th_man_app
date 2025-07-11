"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Schéma Mongoose qui correspond à l'interface
const kycSchema = new mongoose_1.Schema({
    clubWalletAddress: { type: String, required: true, unique: true },
    clubName: { type: String, required: true },
    legalStatus: { type: String, required: true },
    registrationNumber: { type: String, required: true },
    address: { type: String, required: true },
    representativeName: { type: String, required: true },
    documentUrl: { type: String, required: true },
    idCardUrl: { type: String, required: true },
    affiliationNumber: { type: String },
    status: {
        type: String,
        enum: ['pending', 'validated', 'rejected'],
        default: 'pending',
    },
    rejectionReason: { type: String },
}, {
    // Ajoute automatiquement les champs createdAt et updatedAt
    timestamps: true,
});
// Crée et exporte le modèle pour pouvoir l'utiliser ailleurs
const KYC = (0, mongoose_1.model)('KYC', kycSchema);
exports.default = KYC;
