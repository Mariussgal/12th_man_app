import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface ICampaignImage extends Document {
  campaignId: number;
  imageUrl: string;
}

const CampaignImageSchema: Schema = new Schema<ICampaignImage>({
  campaignId: { type: Number, required: true, unique: true },
  imageUrl: { type: String, required: true },
});

export default models.CampaignImage || model<ICampaignImage>('CampaignImage', CampaignImageSchema); 