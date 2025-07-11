import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import KYC from '@/models/Kyc';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    const { clubWalletAddress, clubName, legalStatus, registrationNumber, address, representativeName, documentUrl, idCardUrl, affiliationNumber } = body;

    if (!clubWalletAddress || !clubName || !legalStatus || !registrationNumber || !address || !representativeName || !documentUrl || !idCardUrl) {
      return NextResponse.json({ message: "Tous les champs obligatoires doivent être remplis." }, { status: 400 });
    }

    const existingKyc = await KYC.findOne({ clubWalletAddress });
    if (existingKyc) {
      return NextResponse.json({ message: "Une demande de KYC existe déjà pour cette adresse de wallet." }, { status: 409 });
    }

    const newKyc = await KYC.create({
      clubWalletAddress,
      clubName,
      legalStatus,
      registrationNumber,
      address,
      representativeName,
      documentUrl,
      idCardUrl,
      affiliationNumber,
      status: 'pending',
    });

    // Mettre à jour le statut kycValidated de l'utilisateur
    await User.findOneAndUpdate(
      { walletAddress: clubWalletAddress },
      { kycValidated: true },
      { new: true }
    );

    return NextResponse.json({ message: 'Demande KYC soumise avec succès.', kyc: newKyc }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Erreur serveur lors de la soumission du KYC.', error }, { status: 500 });
  }
} 