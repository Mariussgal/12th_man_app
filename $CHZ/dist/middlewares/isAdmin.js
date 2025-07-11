"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * Middleware pour vérifier si la requête vient d'un admin.
 * L'admin doit fournir une clé secrète dans les en-têtes (headers).
 */
const isAdmin = (req, res, next) => {
    try {
        // On cherche une clé dans les en-têtes de la requête
        const adminKey = req.headers['x-admin-key'];
        // Si pas de clé ou si la clé est fausse
        if (!adminKey || adminKey !== process.env.ADMIN_SECRET_KEY) {
            return res.status(403).json({ message: 'Accès interdit. Clé admin invalide.' });
        }
        // Si tout est bon, on le laisse passer à la suite
        next();
    }
    catch (error) {
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
};
exports.isAdmin = isAdmin;
