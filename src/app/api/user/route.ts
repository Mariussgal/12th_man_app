import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

// GET /api/user?walletAddress=0x...
export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const walletAddress = searchParams.get('walletAddress');
  if (!walletAddress) {
    return NextResponse.json({ error: 'walletAddress is required' }, { status: 400 });
  }
  const user = await User.findOne({ walletAddress });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  return NextResponse.json(user);
}

// POST /api/user
export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const { walletAddress, accountType } = body;
  if (!walletAddress || !accountType) {
    return NextResponse.json({ error: 'walletAddress and accountType are required' }, { status: 400 });
  }
  // Vérifie si l'utilisateur existe déjà
  let user = await User.findOne({ walletAddress });
  if (user) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 });
  }
  user = await User.create({ walletAddress, accountType });
  return NextResponse.json(user, { status: 201 });
} 