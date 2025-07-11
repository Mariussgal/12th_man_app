import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IUser extends Document {
  walletAddress: string;
  accountType: 'user' | 'club';
  kycValidated: boolean;
  createdAt: Date;
}

const UserSchema: Schema = new Schema<IUser>({
  walletAddress: { type: String, required: true, unique: true },
  accountType: { type: String, enum: ['user', 'club'], required: true },
  kycValidated: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default models.User || model<IUser>('User', UserSchema);
