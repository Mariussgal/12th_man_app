'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import campaignsData from '../../../../data/campaigns.json';
import { CONTRACTS, TWELFTH_MAN_ABI, ERC20_ABI } from '../../../../config/contracts';

export default function LendPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Hooks wagmi
  const { address, isConnected } = useAccount();
  
  // Hook to write to contract (contribution)
  const { 
    writeContract: contribute, 
    data: contributeHash,
    isPending: isContributePending,
    error: contributeError 
  } = useWriteContract();

  // Hook to write to PSG contract (approval)
  const { 
    writeContract: approve, 
    data: approveHash,
    isPending: isApprovePending,
    error: approveError 
  } = useWriteContract();

  // Wait for transaction confirmations
  const { isLoading: isContributeConfirming } = useWaitForTransactionReceipt({
    hash: contributeHash,
  });
  
  const { isLoading: isApproveConfirming } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Read USDC balance
  const { data: psgBalance = '0', error: balanceError, isLoading: isBalanceLoading } = useReadContract({
    address: CONTRACTS.USDC_TOKEN as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: { enabled: !!address }
  });

  // Read USDC allowance
  const { data: allowance = '0', error: allowanceError, isLoading: isAllowanceLoading } = useReadContract({
    address: CONTRACTS.USDC_TOKEN as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address as `0x${string}`, CONTRACTS.TWELFTH_MAN as `0x${string}`],
    query: { enabled: !!address }
  });



  // Read USDC token decimals for verification
  const { data: tokenDecimals } = useReadContract({
    address: CONTRACTS.USDC_TOKEN as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'decimals',
    query: { enabled: !!address }
  });

  // Function to correctly format PSG balance
  const formatPSGBalance = (rawBalance: bigint | string, decimals: number | undefined) => {
    if (!rawBalance) return '0.00';
    
    // If decimals not loaded yet, assume 0 decimals (PSG case)
    const actualDecimals = decimals ?? 0;
    
    const balance = BigInt(rawBalance.toString());
    const divisor = BigInt(10 ** actualDecimals);
    const formattedBalance = Number(balance) / Number(divisor);
    
    return formattedBalance.toFixed(2);
  };

  // Read campaign info
  const { data: campaignInfo, refetch: refetchCampaignInfo, isLoading: isCampaignLoading } = useReadContract({
    address: CONTRACTS.TWELFTH_MAN as `0x${string}`,
    abi: TWELFTH_MAN_ABI,
    functionName: 'getCampaignInfo',
    args: [BigInt(campaignId)],
    query: { enabled: !!campaignId }
  });

  // Campaign data from JSON (pour les campagnes simulées) avec fallback blockchain
  const jsonCampaign = campaignsData.find((c: any) => c.id === parseInt(campaignId));

  const isLoading = isContributePending || isApprovePending || isContributeConfirming || isApproveConfirming;



  // Debug raw smart contract data
  console.log('Raw getCampaignInfo data:', campaignInfo);
  if (campaignInfo) {
    console.log('Value details:', {
      index0: campaignInfo[0]?.toString(),
      index1: campaignInfo[1]?.toString(),
      index2: campaignInfo[2]?.toString(),
      index3: campaignInfo[3]?.toString(),
      index4: campaignInfo[4]?.toString(),
      index5: campaignInfo[5]?.toString(),
      index6: campaignInfo[6],
      index7: campaignInfo[7]
    });
  }

  // Extract smart contract data (with correct indices)
  const campaignData = campaignInfo ? {
    clubName: campaignInfo[1] || '',                 // clubName (index 1)
    targetAmount: campaignInfo[2] || BigInt(0),      // targetAmount (index 2)
    totalRaised: campaignInfo[3] || BigInt(0),       // collectedAmount (index 3)
    annualRate: (Number(campaignInfo[4] || BigInt(0))) / 100,  // annualInterestRate (index 4) converted from basis points
    deadline: campaignInfo[5] || BigInt(0),          // deadline (index 5)
    loanDuration: campaignInfo[6] || BigInt(0),      // loanDuration (index 6)
    loanStartTime: campaignInfo[7] || BigInt(0),     // loanStartTime (index 7)
    isActive: campaignInfo[8] || false,              // isActive (index 8)
    isCompleted: campaignInfo[9] || false,           // isCompleted (index 9)
    contributorsCount: campaignInfo[10] || BigInt(0) // contributorsCount (index 10)
  } : null;

  // Calculate days left and duration in days
  const daysLeft = campaignData ? (() => {
    const deadline = Number(campaignData.deadline);
    const currentTime = Math.floor(Date.now() / 1000);
    return deadline > currentTime ? Math.ceil((deadline - currentTime) / (24 * 60 * 60)) : 0;
  })() : 0;

  const loanDurationInDays = campaignData ? Math.floor(Number(campaignData.loanDuration) / (24 * 60 * 60)) : 0;

  // Créer un objet campaign combiné (JSON + blockchain)
  const campaign = jsonCampaign || (campaignData ? {
    id: parseInt(campaignId),
    clubName: campaignData.clubName,
    targetAmount: Number(campaignData.targetAmount) / Math.pow(10, 18),
    currentAmount: Number(campaignData.totalRaised) / Math.pow(10, 18),
    interestRate: campaignData.annualRate,
    duration: `${loanDurationInDays} jours`,
    endDate: new Date(Number(campaignData.deadline) * 1000).toISOString().split('T')[0],
    description: `Campagne créée par ${campaignData.clubName}`,
    clubLogo: '/logo/PSG.png',
    backers: Number(campaignData.contributorsCount),
    daysLeft: daysLeft
  } : null);

  // Handle success and errors
  useEffect(() => {
    if (contributeHash && !isContributeConfirming) {
      setSuccess('Loan successful! Your contribution has been recorded.');
      setAmount('');
      setError('');
      
      // Refresh campaign data and PSG balance
      refetchCampaignInfo();
      // PSG balance reloads automatically
    }
  }, [contributeHash, isContributeConfirming, refetchCampaignInfo]);

  useEffect(() => {
    if (approveHash && !isApproveConfirming && amount) {
      // Approbation terminée, maintenant faire la contribution automatiquement
      setSuccess('Étape 2/2 : Prêt en cours...');
      
      const actualDecimals = tokenDecimals ?? 0;
      const amountInTokenUnits = BigInt(parseFloat(amount) * (10 ** actualDecimals));
      
      contribute({
        address: CONTRACTS.TWELFTH_MAN as `0x${string}`,
        abi: TWELFTH_MAN_ABI,
        functionName: 'contribute',
        args: [BigInt(campaignId), amountInTokenUnits],
      });
    }
  }, [approveHash, isApproveConfirming, amount, tokenDecimals, campaignId, contribute]);

  useEffect(() => {
    if (contributeError) {
      console.log('Contribute Error:', contributeError);
      const errorMessage = contributeError?.message || contributeError?.toString() || 'Erreur lors de la contribution';
      setError(errorMessage);
      setSuccess('');
    }
  }, [contributeError]);

  useEffect(() => {
    if (approveError) {
      console.log('Approve Error:', approveError);
      const errorMessage = approveError?.message || approveError?.toString() || 'Erreur lors de l\'approbation';
      setError(errorMessage);
      setSuccess('');
    }
  }, [approveError]);

  const handleLend = async () => {
    if (!amount) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setError('');
      
      // Use 0 decimals by default if not loaded yet (PSG case)
      const actualDecimals = tokenDecimals ?? 0;
      
      // Convert amount with correct PSG token decimals
      const amountInTokenUnits = BigInt(parseFloat(amount) * (10 ** actualDecimals));
      
      // Check allowance
      const currentAllowance = BigInt(allowance?.toString() || '0');
      
      if (currentAllowance < amountInTokenUnits) {
        // Step 1: Approval needed
        setSuccess('Step 1/2: Token approval in progress...');
        
        approve({
          address: CONTRACTS.USDC_TOKEN as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [CONTRACTS.TWELFTH_MAN as `0x${string}`, amountInTokenUnits],
        });
      } else {
        // Step 2: Direct contribution (allowance already sufficient)
        setSuccess('Loan in progress...');
        
        contribute({
          address: CONTRACTS.TWELFTH_MAN as `0x${string}`,
          abi: TWELFTH_MAN_ABI,
          functionName: 'contribute',
          args: [BigInt(campaignId), amountInTokenUnits],
        });
      }
      
    } catch (error: any) {
      console.error('Error during loan:', error);
      setError(error.message || 'Error during transaction');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format PSG amounts from smart contract
  const formatPSGAmount = (amount: bigint, forceEtherDecimals = false) => {
    console.log('PSG formatting:', { amount: amount.toString(), tokenDecimals, forceEtherDecimals });
    
    // If it's a very large number, it's probably in wei (18 decimals)
    const actualDecimals = forceEtherDecimals || amount > BigInt("1000000000000000000") ? 18 : (tokenDecimals ?? 0);
    const divisor = BigInt(10 ** actualDecimals);
    
    const formatted = amount / divisor;
    console.log('Formatting result:', formatted.toString());
    return formatted.toString();
  };

  if (!campaign) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-white text-center">Campaign not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white mb-4 flex items-center"
        >
          ← Retour
        </button>
        
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
              <img 
                src={campaign.clubLogo} 
                alt={`Logo ${campaign.clubName}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {isCampaignLoading ? '...' : (campaignData && campaignData.clubName ? campaignData.clubName : campaign.clubName)}
              </h1>
              <p className="text-green-400 font-semibold">
                {isCampaignLoading ? '...' : (campaignData ? `${campaignData.annualRate}%` : `${campaign.interestRate}%`)} APY
              </p>
            </div>
          </div>
          
          <p className="text-gray-300 mb-4">{campaign.description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-white font-bold text-lg">
                {isCampaignLoading ? '...' : campaignData ? `${formatPSGAmount(campaignData.totalRaised)} USDC` : '0 USDC'}
              </div>
              <div className="text-gray-400 text-sm">Collected</div>
            </div>
            <div>
              <div className="text-white font-bold text-lg">
                {isCampaignLoading ? '...' : campaignData ? `${formatPSGAmount(campaignData.targetAmount, true)} USDC` : `${formatCurrency(campaign.targetAmount)}`}
              </div>
              <div className="text-gray-400 text-sm">Goal</div>
            </div>
            <div>
              <div className="text-white font-bold text-lg">
                {isCampaignLoading ? '...' : campaignData ? Number(campaignData.contributorsCount).toString() : '0'}
              </div>
              <div className="text-gray-400 text-sm">Investors</div>
            </div>
            <div>
              <div className="text-white font-bold text-lg">
                {isCampaignLoading ? '...' : (campaignData ? daysLeft : campaign.daysLeft)}
              </div>
              <div className="text-gray-400 text-sm">Days remaining</div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire de contribution */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 p-6">
        <h2 className="text-xl font-bold text-white mb-6">
          Lend to {isCampaignLoading ? '...' : (campaignData && campaignData.clubName ? campaignData.clubName : campaign.clubName)}
        </h2>
        
        {!isConnected ? (
          <div className="text-center">
            <p className="text-gray-300 mb-4">Connect your wallet to start</p>
            <p className="text-gray-400 text-sm">Use the "Connect Wallet" button at the top right</p>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">Connected wallet:</p>
              <p className="text-white font-mono text-sm bg-gray-800 p-2 rounded">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>

            {/* Solde PSG */}
            <div className="mb-6 bg-gray-800/30 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Vos tokens USDC</h3>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {isBalanceLoading ? 'Loading...' : formatPSGBalance(psgBalance as bigint || BigInt(0), tokenDecimals as number)} USDC
                </div>
                <div className="text-gray-400 text-sm">Available balance</div>
              </div>
              
              {balanceError && (
                <div className="mt-3 text-center text-red-400 text-sm">
                  Error loading balance
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Montant à prêter (USDC)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Ex: 100"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  min="0"
                  step="0.1"
                />
                <div className="absolute right-3 top-3 text-gray-400 text-sm">USDC</div>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Montant minimum: 0.1 USDC
              </p>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 mb-4">
                <p className="text-green-400 text-sm">{success}</p>
              </div>
            )}

            <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-white mb-2">Loan Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                                      <span className="text-gray-400">Annual interest rate:</span>
                  <span className="text-green-400 font-semibold">
                    {isCampaignLoading ? '...' : (campaignData ? `${campaignData.annualRate}%` : `${campaign.interestRate}%`)}
                  </span>
                </div>
                <div className="flex justify-between">
                                      <span className="text-gray-400">Duration:</span>
                  <span className="text-white">
                    {isCampaignLoading ? '...' : (campaignData ? `${loanDurationInDays} jours` : campaign.duration)}
                  </span>
                </div>
                <div className="flex justify-between">
                                      <span className="text-gray-400">Loan token:</span>
                  <span className="text-white">USDC</span>
                </div>
                <div className="flex justify-between">
                                      <span className="text-gray-400">Interest paid in:</span>
                  <span className="text-white">wCHZ</span>
                </div>
              </div>
            </div>

            {/* Bouton de prêt */}
            <div>
              <button
                onClick={handleLend}
                disabled={
                  isLoading || 
                  !amount || 
                  parseFloat(amount) <= 0 ||
                  parseFloat(amount) > parseFloat(formatPSGBalance(psgBalance as bigint || BigInt(0), tokenDecimals))
                }
                className={`w-full py-3 rounded-lg font-medium transition-all ${
                  isLoading || 
                  !amount || 
                  parseFloat(amount) <= 0 ||
                  parseFloat(amount) > parseFloat(formatPSGBalance(psgBalance as bigint || BigInt(0), tokenDecimals))
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                }`}
              >
                {isLoading ? 'Transaction in progress...' : 'Lend Now'}
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-400 space-y-2">
              {amount && parseFloat(amount) > parseFloat(formatPSGBalance(psgBalance as bigint || BigInt(0), tokenDecimals)) && (
                <div className="bg-red-900/20 border border-red-500/30 rounded p-2">
                  <p className="text-red-400">
                    ❌ Insufficient balance. You have {formatPSGBalance(psgBalance as bigint || BigInt(0), tokenDecimals)} USDC available.
                  </p>
                </div>
              )}
              
              <p className="text-center">
                By clicking "Lend Now", you agree to transfer {amount || '...'} USDC 
                to the smart contract for campaign {campaign.clubName}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Additional information */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 p-6 mt-6">
        <h3 className="text-lg font-bold text-white mb-4">How it works</h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-start space-x-3">
            <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
            <p>Vous prêtez des tokens USDC au club via le smart contract</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
            <p>The club uses the funds for its needs (equipment, players, etc.)</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
            <p>At the end of the period, you receive your capital + interest in wCHZ</p>
          </div>
        </div>
      </div>
    </div>
  );
}