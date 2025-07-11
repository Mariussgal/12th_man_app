"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Schéma Mongoose pour le Club
const clubSchema = new mongoose_1.Schema({
    clubName: { type: String, required: true },
    walletAddress: { type: String, required: true, unique: true },
    kycValidated: { type: Boolean, default: false },
    // ... autres champs du club
}, {
    timestamps: true,
});
const Club = (0, mongoose_1.model)('Club', clubSchema);
exports.default = Club;
