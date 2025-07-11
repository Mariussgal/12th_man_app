import { Schema, model, Document } from 'mongoose';

// Interface pour le Club
export interface IClub extends Document {
  // On imagine que le club a d'autres champs, mais pour le KYC on a besoin de ceux-là
  clubName: string;
  walletAddress: string;
  kycValidated: boolean;
}

// Schéma Mongoose pour le Club
const clubSchema = new Schema<IClub>({
  clubName: { type: String, required: true },
  walletAddress: { type: String, required: true, unique: true },
  kycValidated: { type: Boolean, default: false },
  // ... autres champs du club
}, {
  timestamps: true,
});

const Club = model<IClub>('Club', clubSchema);
export default Club;