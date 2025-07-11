import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import kycRoutes from './routes/kycRoutes';

// Charger les variables d'environnement du fichier .env
dotenv.config();

// Création de l'application Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour pouvoir lire le JSON dans le corps des requêtes
app.use(express.json());

// Connexion à la base de données MongoDB
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error("ERREUR: La variable d'environnement MONGODB_URI n'est pas définie.");
  process.exit(1); // Arrête le processus si la clé n'est pas là
}

mongoose.connect(mongoUri)
  .then(() => console.log('✅ Connecté à MongoDB avec succès !'))
  .catch((err) => console.error('❌ Erreur de connexion à MongoDB:', err));


// Routes principales de l'application
app.get('/', (req: Request, res: Response) => {
  res.send('<h1>Bienvenue sur le module KYC de 12th Man !</h1>');
});

// Utiliser les routes KYC sous le préfixe /api/kyc
app.use('/api/kyc', kycRoutes);

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});