"use client";

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';
import Image from 'next/image';
import campaignsData from '../../data/campaigns.json';
import { CONTRACTS, TWELFTH_MAN_ABI, USDC_TOKEN_ABI } from '../../config/contracts';

interface CampaignInvestment {
  campaignId: number;
  contribution: bigint;
  campaignInfo: any;
  canClaimRefund: boolean;
  status: string;
}

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [userInvestments, setUserInvestments] = useState<CampaignInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingRefund, setClaimingRefund] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Hook pour écrire dans le contrat (claim refund)
  const { 
    writeContract: claimRefund, 
    data: claimHash,
    isPending: isClaimPending,
    error: claimError 
  } = useWriteContract();

  // Attendre la confirmation de transaction
  const { isLoading: isClaimConfirming, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({
    hash: claimHash,
  });

  // Get campaigns where user has contributed
  const { data: userCampaignIds, refetch: refetchUserCampaigns } = useReadContract({
    address: CONTRACTS.TWELFTH_MAN as `0x${string}`,
    abi: TWELFTH_MAN_ABI,
    functionName: 'getUserContributions',
    args: [address as `0x${string}`],
    query: { enabled: !!address && isConnected }
  });

  // Get USDC balance
  const { data: usdcBalance = '0' } = useReadContract({
    address: CONTRACTS.USDC_TOKEN as `0x${string}`,
    abi: USDC_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: { enabled: !!address }
  });

  // Get USDC token decimals
  const { data: tokenDecimals } = useReadContract({
    address: CONTRACTS.USDC_TOKEN as `0x${string}`,
    abi: USDC_TOKEN_ABI,
    functionName: 'decimals',
    query: { enabled: !!address }
  });

  // Effet pour charger les détails des investissements
  useEffect(() => {
    const loadInvestmentDetails = async () => {
      if (!userCampaignIds || !address) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const investments: CampaignInvestment[] = [];

      try {
        for (const campaignId of userCampaignIds as bigint[]) {
          const id = Number(campaignId);
          
          // Pour chaque campagne, récupérer les détails
          // Note: Ces appels devraient être faits avec useReadContract dans un vrai scénario
          // mais pour simplifier, on simule les appels ici
          
          const campaignData = campaignsData.find(c => c.id === id);
          
          investments.push({
            campaignId: id,
            contribution: BigInt(0), // Sera récupéré individuellement
            campaignInfo: campaignData,
            canClaimRefund: false, // Sera récupéré individuellement
            status: 'LOADING'
          });
        }

        setUserInvestments(investments);
      } catch (error) {
        console.error('Error loading investments:', error);
        setError('Error loading your investments');
      } finally {
        setLoading(false);
      }
    };

    loadInvestmentDetails();
  }, [userCampaignIds, address]);

  // Composant pour récupérer les détails d'une campagne individuelle
  const CampaignDetails = ({ campaignId, children }: { 
    campaignId: number, 
    children: (data: {
      contribution: string,
      campaignInfo: any,
      canClaimRefund: boolean,
      status: string,
      isLoading: boolean
    }) => React.ReactNode 
  }) => {
    const { data: contribution = BigInt(0) } = useReadContract({
      address: CONTRACTS.TWELFTH_MAN as `0x${string}`,
      abi: TWELFTH_MAN_ABI,
      functionName: 'getContribution',
      args: [BigInt(campaignId), address as `0x${string}`],
      query: { enabled: !!address }
    });

    const { data: campaignInfo } = useReadContract({
      address: CONTRACTS.TWELFTH_MAN as `0x${string}`,
      abi: TWELFTH_MAN_ABI,
      functionName: 'getCampaignInfo',
      args: [BigInt(campaignId)],
    });

    const { data: canClaimRefund = false } = useReadContract({
      address: CONTRACTS.TWELFTH_MAN as `0x${string}`,
      abi: TWELFTH_MAN_ABI,
      functionName: 'canClaimRefund',
      args: [BigInt(campaignId), address as `0x${string}`],
      query: { enabled: !!address }
    });

    const { data: status = 'LOADING' } = useReadContract({
      address: CONTRACTS.TWELFTH_MAN as `0x${string}`,
      abi: TWELFTH_MAN_ABI,
      functionName: 'getCampaignStatus',
      args: [BigInt(campaignId)],
    });

         const formattedContribution = formatUSDCAmount(contribution);
     
     return <>{children({
       contribution: formattedContribution,
       campaignInfo,
       canClaimRefund: Boolean(canClaimRefund),
       status: String(status),
       isLoading: false
     })}</>;
  };

  // Gérer le claim du refund
  const handleClaimRefund = async (campaignId: number) => {
    if (!address) return;

    setClaimingRefund(campaignId);
    setError('');
    setSuccess('');

    try {
      await claimRefund({
        address: CONTRACTS.TWELFTH_MAN as `0x${string}`,
        abi: TWELFTH_MAN_ABI,
        functionName: 'claimRefund',
        args: [BigInt(campaignId)],
      });
    } catch (err: any) {
      console.error('Error claiming refund:', err);
      setError('Error claiming refund');
      setClaimingRefund(null);
    }
  };

  // Effect to handle claim success
  useEffect(() => {
    if (isClaimSuccess) {
      setSuccess('Refund claimed successfully!');
      setClaimingRefund(null);
      // Refetch user data
      refetchUserCampaigns();
    }
  }, [isClaimSuccess, refetchUserCampaigns]);

  // Effect to handle claim errors
  useEffect(() => {
    if (claimError) {
      setError('Error claiming refund');
      setClaimingRefund(null);
    }
  }, [claimError]);

  // Function to properly format USDC balance
  const formatUSDCBalance = (rawBalance: bigint | string, decimals: number | undefined) => {
    if (!rawBalance) return '0.00';
    
    // If decimals is not loaded yet, assume 0 decimals (USDC case)
    const actualDecimals = decimals ?? 0;
    
    const balance = BigInt(rawBalance.toString());
    const divisor = BigInt(10 ** actualDecimals);
    const formattedBalance = Number(balance) / Number(divisor);
    
    return formattedBalance.toFixed(2);
  };

  // Format USDC amounts from smart contract
  const formatUSDCAmount = (amount: bigint, forceEtherDecimals = false) => {
    // If it's a very large number, it's probably in wei (18 decimals)
    const actualDecimals = forceEtherDecimals || amount > BigInt("1000000000000000000") ? 18 : (tokenDecimals ?? 0);
    const divisor = BigInt(10 ** actualDecimals);
    
    const formatted = amount / divisor;
    return formatted.toString();
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'ACTIVE': 'bg-green-500',
      'SUCCESS_PENDING_WITHDRAWAL': 'bg-blue-500',
      'FUNDED': 'bg-blue-600',
      'FAILED_REFUND_AVAILABLE': 'bg-red-500',
      'INACTIVE': 'bg-gray-500',
      'LOADING': 'bg-gray-400'
    };

    const statusLabels = {
      'ACTIVE': 'Active',
      'SUCCESS_PENDING_WITHDRAWAL': 'Success Pending',
      'FUNDED': 'Funded',
      'FAILED_REFUND_AVAILABLE': 'Failed - Refund Available',
      'INACTIVE': 'Inactive',
      'LOADING': 'Loading...'
    };

    const colorClass = statusColors[status as keyof typeof statusColors] || 'bg-gray-400';
    const label = statusLabels[status as keyof typeof statusLabels] || status;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${colorClass}`}>
        {label}
      </span>
    );
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 font-sans text-center">
        <h1 className="text-3xl font-bold text-white mb-4">My Profile</h1>
        <p className="text-gray-400">Please connect your wallet to view your profile</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 font-sans">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-gray-400">Manage your investments and claim your refunds</p>
      </div>

      {/* Messages d'erreur et de succès */}
      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-300 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-900/30 border border-green-500 text-green-300 p-4 rounded-lg mb-6">
          {success}
        </div>
      )}

            {/* Profile information */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Account Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Wallet Address</p>
            <p className="text-white font-mono">{formatAddress(address || '')}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">USDC Balance</p>
            <p className="text-white font-medium">{formatUSDCBalance(usdcBalance, tokenDecimals)} USDC</p>
          </div>
        </div>
      </div>

      {/* My Investments */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 p-6">
        <h2 className="text-xl font-bold text-white mb-6">My Investments</h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading your investments...</p>
          </div>
        ) : !userCampaignIds || userCampaignIds.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">You haven't invested in any campaign yet</p>
            <p className="text-sm text-gray-500">Explore available campaigns on the homepage</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(userCampaignIds as bigint[]).map((campaignId) => {
              const id = Number(campaignId);
              const campaignData = campaignsData.find(c => c.id === id);
              
              return (
                <CampaignDetails key={id} campaignId={id}>
                  {({ contribution, campaignInfo, canClaimRefund, status, isLoading }) => (
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          {campaignData?.clubLogo && (
                            <div className="w-12 h-12 rounded-lg overflow-hidden">
                              <Image
                                src={campaignData.clubLogo}
                                alt={`${campaignData.clubName} logo`}
                                width={48}
                                height={48}
                                className="object-contain"
                              />
                            </div>
                          )}
                          <div>
                            <h3 className="text-lg font-bold text-white">
                              {campaignInfo ? String(campaignInfo[1]) : campaignData?.clubName || `Campagne #${id}`}
                            </h3>
                                                         <p className="text-gray-400 text-sm">
                               {campaignData?.league || 'Unknown League'}
                             </p>
                          </div>
                        </div>
                        {getStatusBadge(status)}
                      </div>

                                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                         <div>
                           <p className="text-gray-400 text-sm">My Investment</p>
                           <p className="text-white font-bold text-lg">{contribution} USDC</p>
                         </div>
                         {campaignInfo && (
                           <>
                             <div>
                               <p className="text-gray-400 text-sm">Interest Rate</p>
                               <p className="text-white font-medium">
                                 {Number(campaignInfo[4]) / 100}% per year
                               </p>
                             </div>
                             <div>
                               <p className="text-gray-400 text-sm">Deadline</p>
                               <p className="text-white font-medium">
                                 {new Date(Number(campaignInfo[5]) * 1000).toLocaleDateString('en-US')}
                               </p>
                             </div>
                           </>
                         )}
                       </div>

                      {campaignData?.description && (
                        <p className="text-gray-300 text-sm mb-4">{campaignData.description}</p>
                      )}

                                             {canClaimRefund && (
                         <div className="pt-4 border-t border-gray-700">
                           <button
                             onClick={() => handleClaimRefund(id)}
                             disabled={claimingRefund === id || isClaimPending || isClaimConfirming}
                             className="bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors"
                           >
                             {claimingRefund === id ? (
                               isClaimConfirming ? 'Confirming...' : 'Claiming...'
                             ) : (
                               'Claim Refund'
                             )}
                           </button>
                           <p className="text-yellow-400 text-xs mt-2">
                             ⚠️ The campaign has failed. You can claim your full refund.
                           </p>
                         </div>
                       )}
                    </div>
                  )}
                </CampaignDetails>
              );
            })}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 p-6 mt-6">
        <h3 className="text-lg font-bold text-white mb-4">How it works</h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-start space-x-3">
            <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
            <p>Your USDC token investments are listed above</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
            <p>If a campaign fails (doesn't reach its goal), you can claim a 1:1 refund</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
            <p>If a campaign succeeds, you will receive your capital + interest in CHZ at the end of the period</p>
          </div>
        </div>
      </div>
    </div>
  );
}