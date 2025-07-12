"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useReadContract, usePublicClient } from 'wagmi';
import { CONTRACTS, TWELFTH_MAN_ABI } from "../../config/contracts";
import { 
  generateMockLeaderboard, 
  getMockClubStats, 
  getMockGlobalStats,
  formatAmount,
  formatAmountUSD,
  formatAddress,
  type MockLeaderboardEntry 
} from "../../utils/mockLeaderboard";
import { usePSGLeaderboard, type PSGLeaderboardEntry } from "../../hooks/usePSGLeaderboard";
import { getAllCampaigns, type Campaign } from "../../utils/campaignUtils";

export default function LeaderboardPage() {
  const [selectedClub, setSelectedClub] = useState<number | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<(MockLeaderboardEntry | PSGLeaderboardEntry)[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);

  const publicClient = usePublicClient();
  const globalStats = getMockGlobalStats();
  
  // Charger toutes les campagnes (statiques + dynamiques)
  useEffect(() => {
    async function fetchCampaigns() {
      setLoadingCampaigns(true);
      try {
        const allCampaigns = await getAllCampaigns(publicClient);
        setCampaigns(allCampaigns);
      } catch (error) {
        console.error('Erreur lors du chargement des campagnes:', error);
      } finally {
        setLoadingCampaigns(false);
      }
    }
    
    fetchCampaigns();
  }, [publicClient]);
  
  // Hook to fetch PSG data from smart contract
  const { 
    leaderboard: psgLeaderboard, 
    stats: psgStats, 
    isLoading: isPSGLoading,
    error: psgError,
    hasData: hasPSGData 
  } = usePSGLeaderboard();

  // Hook pour récupérer les informations des campagnes (utilise JSON comme source principale)
  const CampaignInfo = ({ campaignId, children }: { 
    campaignId: number, 
    children: (data: { 
      contributorsCount: number,
      collectedAmount: number,
      clubName: string,
      isLoading: boolean 
    }) => React.ReactNode 
  }) => {
    // Trouver la campagne correspondante dans nos données
    const campaignData = campaigns.find((c: Campaign) => c.id === campaignId);
    
    // Essayer de récupérer les données blockchain comme complément (désactivé pour la démo)
    const { data: campaignInfo, isLoading } = useReadContract({
      address: CONTRACTS.TWELFTH_MAN as `0x${string}`,
      abi: TWELFTH_MAN_ABI,
      functionName: 'getCampaignInfo',
      args: [BigInt(campaignId)],
      query: { enabled: false } // Désactivé pour la démo
    });

    // Utiliser les données JSON comme source principale
    if (campaignData) {
      return <>{children({ 
        contributorsCount: campaignData.backers,
        collectedAmount: campaignData.currentAmount,
        clubName: campaignData.clubName,
        isLoading: false
      })}</>;
    }
    
    // Fallback vers les données blockchain si pas de données JSON
    if (campaignInfo) {
      const contributorsCount = Number(campaignInfo[10] || BigInt(0));
      const smartContractClubName = campaignInfo[1] || '';
      const rawCollectedAmount = campaignInfo[3] || BigInt(0);
      const collectedAmount = Number(rawCollectedAmount) / Math.pow(10, 18);
      
      return <>{children({ 
        contributorsCount,
        collectedAmount,
        clubName: smartContractClubName,
        isLoading
      })}</>;
    }
    
    // Données par défaut
    return <>{children({ 
      contributorsCount: 0,
      collectedAmount: 0,
      clubName: '',
      isLoading: false
    })}</>;
  };

  const formatCurrency = (amount: number) => {
    return formatAmountUSD(amount);
  };

  const handleClubClick = (campaignId: number) => {
    setSelectedClub(campaignId);
    
    if (campaignId === 1) {
      // PSG réelle (smart contract) - use real smart contract data
      setLeaderboardData(psgLeaderboard);
    } else {
      // Autres clubs (simulés ou blockchain) - generate mock data
      const mockLeaderboard = generateMockLeaderboard(campaignId);
      setLeaderboardData(mockLeaderboard);
    }
  };

  if (selectedClub) {
    const selectedCampaign = campaigns.find((c: Campaign) => c.id === selectedClub);
    const clubStats = getMockClubStats(selectedClub);
    
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 font-sans">
        {/* Header avec retour */}
        <div className="mb-8">
          <button 
            onClick={() => setSelectedClub(null)}
            className="text-gray-400 hover:text-white mb-4 flex items-center transition-colors"
          >
            ← Back to Clubs
          </button>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl overflow-hidden flex-shrink-0">
              <Image
                src={selectedCampaign?.clubLogo || ""}
                alt={`${selectedCampaign?.clubName} logo`}
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                <CampaignInfo campaignId={selectedClub}>
                  {({ clubName, isLoading }) => (
                    isLoading ? '...' : (clubName || selectedCampaign?.clubName)
                  )}
                </CampaignInfo>
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">Top Contributors Leaderboard</p>
            </div>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {selectedClub === 1 ? (
            // PSG - use PSG hook data
            <>
              <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl backdrop-blur-md border border-white/20 p-4 sm:p-6 text-center">
                <div className="text-xl sm:text-2xl font-bold text-white mb-1">
                  {isPSGLoading ? '...' : psgStats.totalContributors}
                </div>
                <div className="text-gray-400 text-xs sm:text-sm">Total Contributors</div>
              </div>
              
              <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl backdrop-blur-md border border-white/20 p-4 sm:p-6 text-center">
                <div className="text-xl sm:text-2xl font-bold text-green-400 mb-1">
                  {isPSGLoading ? '...' : formatAmountUSD(psgStats.totalAmountUSD)}
                </div>
                <div className="text-gray-400 text-xs sm:text-sm">Total Raised</div>
              </div>
              
              <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl backdrop-blur-md border border-white/20 p-4 sm:p-6 text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-400 mb-1">
                  {isPSGLoading ? '...' : formatAmountUSD(psgStats.averageContributionUSD)}
                </div>
                <div className="text-gray-400 text-xs sm:text-sm">Avg. Contribution</div>
              </div>
            </>
          ) : (
            // Other clubs - use mock data
            (() => {
              const clubStats = getMockClubStats(selectedClub);
              return (
                <>
                  <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl backdrop-blur-md border border-white/20 p-4 sm:p-6 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1">
                      {clubStats.totalContributors}
                    </div>
                    <div className="text-gray-400 text-xs sm:text-sm">Total Contributors</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl backdrop-blur-md border border-white/20 p-4 sm:p-6 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-green-400 mb-1">
                      {formatAmountUSD(clubStats.totalAmountUSD)}
                    </div>
                    <div className="text-gray-400 text-xs sm:text-sm">Total Raised</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl backdrop-blur-md border border-white/20 p-4 sm:p-6 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-blue-400 mb-1">
                      {formatAmountUSD(clubStats.averageContributionUSD)}
                    </div>
                    <div className="text-gray-400 text-xs sm:text-sm">Avg. Contribution</div>
                  
                  </div>
                </>
              );
            })()
          )}
        </div>

        {/* Leaderboard */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-3xl backdrop-blur-md border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Leaderboard</h2>
            <p className="text-gray-400 text-sm">Top 10 contributors ranked by amount invested</p>
          </div>
          
          <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
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
                      {formatAmount(entry.amount)} USDC
                    </div>
                    <div className="text-green-400 text-sm font-medium">
                      {formatAmountUSD(entry.amountUSD)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {leaderboardData.length === 0 && (
            <div className="p-12 text-center">
              {selectedClub === 1 ? (
                // PSG-specific messages
                isPSGLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
                    <div className="text-gray-400 mb-2">Loading USDC contributors...</div>
                    <div className="text-gray-500 text-sm">Fetching data from smart contract</div>
                  </>
                ) : psgError ? (
                  <>
                    <div className="text-red-400 mb-2">Error loading USDC data</div>
                    <div className="text-gray-500 text-sm">{psgError}</div>
                  </>
                ) : (
                  <>
                    <div className="text-gray-400 mb-2">No contributors yet</div>
                    <div className="text-gray-500 text-sm">Be the first to contribute to this campaign!</div>
                  </>
                )
              ) : (
                                  // Messages for other clubs
                <>
                  <div className="text-gray-400 mb-2">No contributors yet</div>
                  <div className="text-gray-500 text-sm">Be the first to contribute to this campaign!</div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loadingCampaigns) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8 font-sans">
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
        
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading campaigns...</p>
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
        {campaigns.map((campaign: Campaign) => (
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
                <div className="flex justify-between items-center space-x-4">
                  {campaign.clubLogo && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden">
                      <Image
                        src={campaign.clubLogo}
                        alt={`${campaign.clubName} logo`}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>
                  )}
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
                  // PSG réelle (id: 1) uses PSG hook data, others use mock data
                  if (campaign.id === 1) {
                                          // PSG réelle - specialized hook data
                    return (
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Contributors:</span>
                          <span className="text-white font-semibold">
                            {isPSGLoading ? '...' : psgStats.totalContributors}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Raised:</span>
                          <span className="text-green-400 font-semibold">
                            {isPSGLoading ? '...' : formatAmountUSD(psgStats.totalAmountUSD)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-400">In USDC:</span>
                          <span className="text-gray-300 text-sm">
                            {isPSGLoading ? '...' : formatAmount(psgStats.totalAmount)} USDC
                          </span>
                        </div>
                      </div>
                    );
                  } else {
                                          // Other clubs - mock data
                    const mockStats = getMockClubStats(campaign.id);
                    const hasMockData = mockStats.totalContributors > 0;
                    
                    if (!hasMockData) {
                                              // Fallback to JSON data if no mock data
                      return (
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Contributors:</span>
                            <span className="text-white font-semibold">{campaign.backers}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Total Raised:</span>
                            <span className="text-green-400 font-semibold">{formatCurrency(campaign.currentAmount)}</span>
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Contributors:</span>
                          <span className="text-white font-semibold">
                            {mockStats.totalContributors}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Raised:</span>
                          <span className="text-green-400 font-semibold">
                            {formatAmountUSD(mockStats.totalAmountUSD)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-400">In USDC:</span>
                          <span className="text-gray-300 text-sm">
                            {formatAmount(mockStats.totalAmount)} USDC
                          </span>
                        </div>
                      </div>
                    );
                  }
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