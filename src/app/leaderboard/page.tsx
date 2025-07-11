"use client";

import { useState } from "react";
import Image from "next/image";
import campaignsData from "../../data/campaigns.json";
import { useReadContract } from 'wagmi';
import { CONTRACTS, TWELFTH_MAN_ABI } from "../../config/contracts";

interface LeaderboardEntry {
  address: string;
  amount: number;
  rank: number;
}

export default function LeaderboardPage() {
  const [selectedClub, setSelectedClub] = useState<number | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);

  const campaigns = campaignsData;

  // Hook pour récupérer les informations d'une campagne
  const CampaignInfo = ({ campaignId, children }: { 
    campaignId: number, 
    children: (data: { 
      contributorsCount: number,
      collectedAmount: number,
      clubName: string,
      isLoading: boolean 
    }) => React.ReactNode 
  }) => {
    const { data: campaignInfo, isLoading } = useReadContract({
      address: CONTRACTS.TWELFTH_MAN as `0x${string}`,
      abi: TWELFTH_MAN_ABI,
      functionName: 'getCampaignInfo',
      args: [BigInt(campaignId)],
    });

    const contributorsCount = campaignInfo ? Number(campaignInfo[8] || BigInt(0)) : 0;
    const smartContractClubName = campaignInfo ? campaignInfo[1] || '' : '';
    const rawCollectedAmount = campaignInfo ? campaignInfo[3] || BigInt(0) : BigInt(0);
    const collectedAmount = Number(rawCollectedAmount) / Math.pow(10, 18);
    
    return <>{children({ 
      contributorsCount, 
      collectedAmount,
      clubName: smartContractClubName,
      isLoading 
    })}</>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleClubClick = (campaignId: number) => {
    setSelectedClub(campaignId);
    // TODO: Récupérer les données du leaderboard pour ce club
    // Pour l'instant, on met des données de test
    setLeaderboardData([
      { address: "0x1234567890123456789012345678901234567890", amount: 1000, rank: 1 },
      { address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd", amount: 750, rank: 2 },
      { address: "0x9876543210987654321098765432109876543210", amount: 500, rank: 3 },
    ]);
  };

  if (selectedClub) {
    const selectedCampaign = campaigns.find(c => c.id === selectedClub);
    
    return (
      <div className="max-w-6xl mx-auto px-6 py-8 font-sans">
        {/* Header avec retour */}
        <div className="mb-8">
          <button 
            onClick={() => setSelectedClub(null)}
            className="text-gray-400 hover:text-white mb-4 flex items-center transition-colors"
          >
            ← Back to Clubs
          </button>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 rounded-2xl overflow-hidden">
              <Image
                src={selectedCampaign?.clubLogo || ""}
                alt={`${selectedCampaign?.clubName} logo`}
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                <CampaignInfo campaignId={selectedClub}>
                  {({ clubName, isLoading }) => (
                    isLoading ? '...' : (clubName || selectedCampaign?.clubName)
                  )}
                </CampaignInfo>
              </h1>
              <p className="text-gray-400">Top Contributors</p>
            </div>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <CampaignInfo campaignId={selectedClub}>
            {({ contributorsCount, collectedAmount, isLoading }) => (
              <>
                <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl backdrop-blur-md border border-white/20 p-6 text-center">
                  <div className="text-2xl font-bold text-white mb-1">
                    {isLoading ? '...' : contributorsCount}
                  </div>
                  <div className="text-gray-400 text-sm">Total Contributors</div>
                </div>
                
                <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl backdrop-blur-md border border-white/20 p-6 text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {isLoading ? '...' : formatCurrency(collectedAmount)}
                  </div>
                  <div className="text-gray-400 text-sm">Total Raised</div>
                </div>
                
                <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl backdrop-blur-md border border-white/20 p-6 text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {isLoading ? '...' : (collectedAmount / contributorsCount || 0).toFixed(0)}
                  </div>
                  <div className="text-gray-400 text-sm">Avg. Contribution</div>
                </div>
              </>
            )}
          </CampaignInfo>
        </div>

        {/* Leaderboard */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-3xl backdrop-blur-md border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Leaderboard</h2>
            <p className="text-gray-400 text-sm">Top 50 contributors ranked by amount invested</p>
          </div>
          
          <div className="divide-y divide-white/5">
            {leaderboardData.map((entry, index) => (
              <div key={entry.address} className="p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Rank */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-gray-700 text-white'
                    }`}>
                      {entry.rank}
                    </div>
                    
                    {/* Address */}
                    <div>
                      <div className="text-white font-medium">
                        {formatAddress(entry.address)}
                      </div>
                      <div className="text-gray-400 text-xs">
                        Contributor
                      </div>
                    </div>
                  </div>
                  
                  {/* Amount */}
                  <div className="text-right">
                    <div className="text-white font-bold">
                      {entry.amount} PSG
                    </div>
                    <div className="text-gray-400 text-xs">
                      ≈ {formatCurrency(entry.amount)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {leaderboardData.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-2">No contributors yet</div>
              <div className="text-gray-500 text-sm">Be the first to contribute to this campaign!</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 font-sans">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="rounded-2xl p-8 mx-auto max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className="text-white drop-shadow-2xl" style={{textShadow: '0 4px 8px rgba(0, 0, 0, 0.8)'}}>
              Leaderboard
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Discover the top contributors for each football club campaign
          </p>
        </div>
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            onClick={() => handleClubClick(campaign.id)}
            className="group relative cursor-pointer"
          >
            {/* Card Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl backdrop-blur-md border border-white/20 transition-all duration-500 group-hover:border-white/40 group-hover:from-white/15 group-hover:to-white/10" />
            
            {/* Card Content */}
            <div className="relative p-8 rounded-3xl transition-transform duration-300 group-hover:-translate-y-1">
              {/* Club Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden">
                    <Image
                      src={campaign.clubLogo}
                      alt={`${campaign.clubName} logo`}
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <CampaignInfo campaignId={campaign.id}>
                      {({ clubName, isLoading }) => (
                        <h3 className="text-xl font-bold text-white">
                          {isLoading ? '...' : (clubName || campaign.clubName)}
                        </h3>
                      )}
                    </CampaignInfo>
                    <p className="text-gray-400 text-sm">{campaign.league}</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <CampaignInfo campaignId={campaign.id}>
                {({ contributorsCount, collectedAmount, clubName, isLoading }) => {
                  const hasSmartContractData = !isLoading && (clubName || contributorsCount > 0 || collectedAmount > 0);
                  const displayAmount = hasSmartContractData ? collectedAmount : campaign.currentAmount;
                  const displayContributors = hasSmartContractData ? contributorsCount : campaign.backers;
                  
                  return (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Contributors:</span>
                        <span className="text-white font-semibold">
                          {isLoading ? '...' : displayContributors}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Raised:</span>
                        <span className="text-green-400 font-semibold">
                          {isLoading ? '...' : formatCurrency(displayAmount)}
                        </span>
                      </div>
                    </div>
                  );
                }}
              </CampaignInfo>

              {/* CTA */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="text-center text-gray-400 group-hover:text-white transition-colors">
                  View Leaderboard →
                </div>
              </div>
            </div>

            {/* Hover glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/20 to-purple-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm" />
          </div>
        ))}
      </div>
    </div>
  );
}