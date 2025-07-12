import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface ICampaignImage extends Document {
  campaignId: number;
  imageUrl?: string;
  description?: string;
}

const CampaignImageSchema: Schema = new Schema<ICampaignImage>({
  campaignId: { type: Number, required: true, unique: true },
  imageUrl: { type: String, required: false },
  description: { type: String, required: false },
});

export default models.CampaignImage || model<ICampaignImage>('CampaignImage', CampaignImageSchema);