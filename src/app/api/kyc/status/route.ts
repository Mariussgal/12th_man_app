import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import KYC from '@/models/Kyc';

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const walletAddress = searchParams.get('walletAddress');
  if (!walletAddress) {
    return NextResponse.json({ error: 'walletAddress is required' }, { status: 400 });
  }
  const kyc = await KYC.findOne({ clubWalletAddress: walletAddress });
  if (!kyc) {
    return NextResponse.json({ message: 'No KYC found' }, { status: 404 });
  }
  return NextResponse.json({ status: kyc.status, clubName: kyc.clubName });
} 