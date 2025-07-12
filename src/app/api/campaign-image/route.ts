import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CampaignImage from '@/models/CampaignImage';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { campaignId, imageUrl, description } = await req.json();
  if (!campaignId) {
    return NextResponse.json({ error: 'campaignId is required' }, { status: 400 });
  }

  // Préparer les données à mettre à jour
  const updateData: any = {};
  if (imageUrl) updateData.imageUrl = imageUrl;
  if (description) updateData.description = description;

  const doc = await CampaignImage.findOneAndUpdate(
    { campaignId },
    updateData,
    { upsert: true, new: true }
  );
  return NextResponse.json(doc);
}

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get('campaignId');
  if (!campaignId) {
    return NextResponse.json({ error: 'campaignId is required' }, { status: 400 });
  }
  const doc = await CampaignImage.findOne({ campaignId: Number(campaignId) });
  if (!doc) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(doc);
}