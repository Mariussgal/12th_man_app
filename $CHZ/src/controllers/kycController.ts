import { Request, Response } from 'express';
import KYC, { IKYC } from '../models/kycModel';
import Club from '../models/clubModel'; // On importe le modèle Club

// 1. Soumettre une nouvelle demande de KYC
export const submitKyc = async (req: Request, res: Response) => {
  try {
    const { clubWalletAddress, clubName, legalStatus, registrationNumber, address, representativeName, documentUrl, idCardUrl, affiliationNumber } = req.body;

    // Petite validation pour être sûr qu'on a tout ce qu'il faut
    if (!clubWalletAddress || !clubName || !legalStatus || !registrationNumber || !address || !representativeName || !documentUrl || !idCardUrl) {
        return res.status(400).json({ message: "Tous les champs obligatoires doivent être remplis." });
    }

    // On vérifie si un KYC pour ce wallet n'existe pas déjà
    const existingKyc = await KYC.findOne({ clubWalletAddress });
    if (existingKyc) {
        return res.status(409).json({ message: "Une demande de KYC existe déjà pour cette adresse de wallet." });
    }

    // On crée la nouvelle entrée KYC
    const newKyc = new KYC({
      ...req.body,
      status: 'pending', // On force le statut à 'pending'
    });

    await newKyc.save();

    // On peut aussi créer ou trouver le club associé pour être sûr qu'il existe
    // 'upsert: true' veut dire : si tu ne le trouves pas, crée-le.
    await Club.findOneAndUpdate(
        { walletAddress: clubWalletAddress },
        { clubName: clubName, walletAddress: clubWalletAddress },
        { upsert: true, new: true }
    );

    res.status(201).json({ message: 'Demande KYC soumise avec succès.', kyc: newKyc });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur lors de la soumission du KYC.', error });
  }
};

// 2. Récupérer toutes les demandes KYC (Admin seulement)
export const getAllKycs = async (req: Request, res: Response) => {
  try {
    const kycs = await KYC.find().sort({ createdAt: -1 }); // Tri par date, le plus récent en premier
    res.status(200).json(kycs);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des KYC.' });
  }
};

// 3. Valider un KYC (Admin seulement)
export const validateKyc = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const kyc = await KYC.findById(id);

    if (!kyc) {
      return res.status(404).json({ message: 'KYC non trouvé.' });
    }

    // On met à jour le statut du KYC
    kyc.status = 'validated';
    kyc.rejectionReason = undefined; // On enlève la raison de rejet s'il y en avait une
    await kyc.save();

    // On met à jour le profil du club correspondant
    await Club.findOneAndUpdate({ walletAddress: kyc.clubWalletAddress }, { kycValidated: true });

    res.status(200).json({ message: 'KYC validé avec succès.', kyc });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur lors de la validation du KYC.' });
  }
};

// 4. Rejeter un KYC (Admin seulement)
export const rejectKyc = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ message: 'La raison du rejet est obligatoire.' });
    }

    const kyc = await KYC.findById(id);

    if (!kyc) {
      return res.status(404).json({ message: 'KYC non trouvé.' });
    }

    // On met à jour le statut et la raison du rejet
    kyc.status = 'rejected';
    kyc.rejectionReason = rejectionReason;
    await kyc.save();
    
    // On s'assure que le statut du club est bien 'non validé'
    await Club.findOneAndUpdate({ walletAddress: kyc.clubWalletAddress }, { kycValidated: false });

    res.status(200).json({ message: 'KYC rejeté avec succès.', kyc });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur lors du rejet du KYC.' });
  }
};