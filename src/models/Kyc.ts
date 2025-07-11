import { Schema, model, models, Document } from 'mongoose';

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
  timestamps: true,
});

export default models.KYC || model<IKYC>('KYC', kycSchema); 