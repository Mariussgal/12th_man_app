import { Schema, model, Document } from 'mongoose';

// Interface TypeScript pour typer les données d'un KYC
export interface IKYC extends Document {
  clubWalletAddress: string;
  clubName: string;
  legalStatus: string;
  registrationNumber: string;
  address: string;
  representativeName: string;
  documentUrl: string;
  idCardUrl: string;
  affiliationNumber?: string;
  status: 'pending' | 'validated' | 'rejected';
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Schéma Mongoose qui correspond à l'interface
const kycSchema = new Schema<IKYC>({
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
const KYC = model<IKYC>('KYC', kycSchema);
export default KYC;