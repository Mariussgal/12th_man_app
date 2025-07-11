import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Middleware pour vérifier si la requête vient d'un admin.
 * L'admin doit fournir une clé secrète dans les en-têtes (headers).
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    // On cherche une clé dans les en-têtes de la requête
    const adminKey = req.headers['x-admin-key'];

    // Si pas de clé ou si la clé est fausse
    if (!adminKey || adminKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ message: 'Accès interdit. Clé admin invalide.' });
    }

    // Si tout est bon, on le laisse passer à la suite
    next();
  } catch (error) {
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};