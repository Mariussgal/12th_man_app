"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const kycRoutes_1 = __importDefault(require("./routes/kycRoutes"));
// Charger les variables d'environnement du fichier .env
dotenv_1.default.config();
// Création de l'application Express
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware pour pouvoir lire le JSON dans le corps des requêtes
app.use(express_1.default.json());
// Connexion à la base de données MongoDB
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
    console.error("ERREUR: La variable d'environnement MONGODB_URI n'est pas définie.");
    process.exit(1); // Arrête le processus si la clé n'est pas là
}
mongoose_1.default.connect(mongoUri)
    .then(() => console.log('✅ Connecté à MongoDB avec succès !'))
    .catch((err) => console.error('❌ Erreur de connexion à MongoDB:', err));
// Routes principales de l'application
app.get('/', (req, res) => {
    res.send('<h1>Bienvenue sur le module KYC de 12th Man !</h1>');
});
// Utiliser les routes KYC sous le préfixe /api/kyc
app.use('/api/kyc', kycRoutes_1.default);
// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
