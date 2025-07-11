'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import campaignsData from '../../../../data/campaigns.json';
import { CONTRACTS, TWELFTH_MAN_ABI, PSG_TOKEN_ABI } from '../../../../config/contracts';

export default function LendPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Hooks wagmi
  const { address, isConnected } = useAccount();
  
  // Hook pour écrire dans le contrat (contribution)
  const { 
    writeContract: contribute, 
    data: contributeHash,
    isPending: isContributePending,
    error: contributeError 
  } = useWriteContract();

  // Hook pour écrire dans le contrat PSG (approbation)
  const { 
    writeContract: approve, 
    data: approveHash,
    isPending: isApprovePending,
    error: approveError 
  } = useWriteContract();

  // Attendre les confirmations de transactions
  const { isLoading: isContributeConfirming } = useWaitForTransactionReceipt({
    hash: contributeHash,
  });
  
  const { isLoading: isApproveConfirming } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Lecture du solde PSG
  const { data: psgBalance = '0', error: balanceError, isLoading: isBalanceLoading } = useReadContract({
    address: CONTRACTS.PSG_TOKEN as `0x${string}`,
    abi: PSG_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: { enabled: !!address }
  });

  // Lecture de l'allowance PSG
  const { data: allowance = '0', error: allowanceError, isLoading: isAllowanceLoading } = useReadContract({
    address: CONTRACTS.PSG_TOKEN as `0x${string}`,
    abi: PSG_TOKEN_ABI,
    functionName: 'allowance',
    args: [address as `0x${string}`, CONTRACTS.TWELFTH_MAN as `0x${string}`],
    query: { enabled: !!address }
  });



  // Lecture des décimales du token PSG pour vérification
  const { data: tokenDecimals } = useReadContract({
    address: CONTRACTS.PSG_TOKEN as `0x${string}`,
    abi: PSG_TOKEN_ABI,
    functionName: 'decimals',
    query: { enabled: !!address }
  });

  // Fonction pour formater correctement le solde PSG
  const formatPSGBalance = (rawBalance: bigint | string, decimals: number | undefined) => {
    if (!rawBalance) return '0.00';
    
    // Si decimals n'est pas encore chargé, assumer 0 décimales (cas du PSG)
    const actualDecimals = decimals ?? 0;
    
    const balance = BigInt(rawBalance.toString());
    const divisor = BigInt(10 ** actualDecimals);
    const formattedBalance = Number(balance) / Number(divisor);
    
    return formattedBalance.toFixed(2);
  };

  // Lecture des infos de campagne
  const { data: campaignInfo, refetch: refetchCampaignInfo, isLoading: isCampaignLoading } = useReadContract({
    address: CONTRACTS.TWELFTH_MAN as `0x${string}`,
    abi: TWELFTH_MAN_ABI,
    functionName: 'getCampaignInfo',
    args: [BigInt(campaignId)],
    query: { enabled: !!campaignId }
  });

  // Données de campagne depuis le JSON (pour l'affichage)
  const campaign = campaignsData.find((c: any) => c.id === parseInt(campaignId));

  const isLoading = isContributePending || isApprovePending || isContributeConfirming || isApproveConfirming;



  // Debug des données brutes du smart contract
  console.log('Données brutes getCampaignInfo:', campaignInfo);
  if (campaignInfo) {
    console.log('Détail des valeurs:', {
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

  // Extraction des données du smart contract (avec contributorsCount ajouté)
  const campaignData = campaignInfo ? {
    clubName: campaignInfo[1] || '',                 // clubName (index 1) ← NOUVEAU !
    targetAmount: campaignInfo[2] || BigInt(0),      // targetAmount (index 2)
    totalRaised: campaignInfo[3] || BigInt(0),       // collectedAmount (index 3)
    annualRate: (Number(campaignInfo[4] || BigInt(0))) / 100,  // annualInterestRate (index 4) converti depuis basis points
    deadline: campaignInfo[5] || BigInt(0),          // deadline (index 5)
    isActive: campaignInfo[6] || false,              // isActive (index 6)
    isCompleted: campaignInfo[7] || false,           // isCompleted (index 7)
    contributorsCount: campaignInfo[8] || BigInt(0)  // contributorsCount (index 8)
  } : null;

  // Gérer les succès et erreurs
  useEffect(() => {
    if (contributeHash && !isContributeConfirming) {
      setSuccess('Prêt réussi ! Votre contribution a été enregistrée.');
      setAmount('');
      setError('');
      
      // Actualiser les données de campagne et le solde PSG
      refetchCampaignInfo();
      // Le solde PSG se recharge automatiquement
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
      setError('Veuillez saisir un montant valide');
      return;
    }

    try {
      setError('');
      
      // Utiliser 0 décimales par défaut si pas encore chargé (cas du PSG)
      const actualDecimals = tokenDecimals ?? 0;
      
      // Convertir le montant avec les bonnes décimales du token PSG
      const amountInTokenUnits = BigInt(parseFloat(amount) * (10 ** actualDecimals));
      
      // Vérifier l'allowance
      const currentAllowance = BigInt(allowance?.toString() || '0');
      
      if (currentAllowance < amountInTokenUnits) {
        // Étape 1: Approbation nécessaire
        setSuccess('Étape 1/2 : Approbation des tokens en cours...');
        
        approve({
          address: CONTRACTS.PSG_TOKEN as `0x${string}`,
          abi: PSG_TOKEN_ABI,
          functionName: 'approve',
          args: [CONTRACTS.TWELFTH_MAN as `0x${string}`, amountInTokenUnits],
        });
      } else {
        // Étape 2: Contribution directe (allowance déjà suffisante)
        setSuccess('Prêt en cours...');
        
        contribute({
          address: CONTRACTS.TWELFTH_MAN as `0x${string}`,
          abi: TWELFTH_MAN_ABI,
          functionName: 'contribute',
          args: [BigInt(campaignId), amountInTokenUnits],
        });
      }
      
    } catch (error: any) {
      console.error('Erreur lors du prêt:', error);
      setError(error.message || 'Erreur lors de la transaction');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Formater les montants PSG depuis le smart contract
  const formatPSGAmount = (amount: bigint, forceEtherDecimals = false) => {
    console.log('Formatage PSG:', { amount: amount.toString(), tokenDecimals, forceEtherDecimals });
    
    // Si c'est un très gros nombre, c'est probablement en wei (18 décimales)
    const actualDecimals = forceEtherDecimals || amount > BigInt("1000000000000000000") ? 18 : (tokenDecimals ?? 0);
    const divisor = BigInt(10 ** actualDecimals);
    
    const formatted = amount / divisor;
    console.log('Résultat formatage:', formatted.toString());
    return formatted.toString();
  };

  if (!campaign) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-white text-center">Campagne non trouvée</p>
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
            <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-3xl">
              {campaign.clubLogo}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {isCampaignLoading ? '...' : (campaignData && campaignData.clubName ? campaignData.clubName : campaign.clubName)}
              </h1>
              <p className="text-gray-400">{campaign.league}</p>
              <p className="text-green-400 font-semibold">
                {isCampaignLoading ? '...' : (campaignData ? `${campaignData.annualRate}%` : `${campaign.interestRate}%`)} APY
              </p>
            </div>
          </div>
          
          <p className="text-gray-300 mb-4">{campaign.description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-white font-bold text-lg">
                {isCampaignLoading ? '...' : campaignData ? `${formatPSGAmount(campaignData.totalRaised)} PSG` : '0 PSG'}
              </div>
              <div className="text-gray-400 text-sm">Collecté</div>
            </div>
            <div>
              <div className="text-white font-bold text-lg">
                {isCampaignLoading ? '...' : campaignData ? `${formatPSGAmount(campaignData.targetAmount, true)} PSG` : `${formatCurrency(campaign.targetAmount)}`}
              </div>
              <div className="text-gray-400 text-sm">Objectif</div>
            </div>
            <div>
              <div className="text-white font-bold text-lg">
                {isCampaignLoading ? '...' : campaignData ? Number(campaignData.contributorsCount).toString() : '0'}
              </div>
              <div className="text-gray-400 text-sm">Investisseurs</div>
            </div>
            <div>
              <div className="text-white font-bold text-lg">{campaign.daysLeft}</div>
              <div className="text-gray-400 text-sm">Jours restants</div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire de contribution */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 p-6">
        <h2 className="text-xl font-bold text-white mb-6">
          Prêter à {isCampaignLoading ? '...' : (campaignData && campaignData.clubName ? campaignData.clubName : campaign.clubName)}
        </h2>
        
        {!isConnected ? (
          <div className="text-center">
            <p className="text-gray-300 mb-4">Connectez votre wallet pour commencer</p>
            <p className="text-gray-400 text-sm">Utilisez le bouton "Connect Wallet" en haut à droite</p>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">Wallet connecté:</p>
              <p className="text-white font-mono text-sm bg-gray-800 p-2 rounded">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>

            {/* Solde PSG */}
            <div className="mb-6 bg-gray-800/30 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Vos tokens PSG</h3>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {isBalanceLoading ? 'Chargement...' : formatPSGBalance(psgBalance as bigint || BigInt(0), tokenDecimals as number)} PSG
                </div>
                <div className="text-gray-400 text-sm">Solde disponible</div>
              </div>
              
              {balanceError && (
                <div className="mt-3 text-center text-red-400 text-sm">
                  Erreur lors du chargement du solde
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Montant à prêter (PSG)
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
                <div className="absolute right-3 top-3 text-gray-400 text-sm">PSG</div>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Montant minimum: 0.1 PSG
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
              <h3 className="font-semibold text-white mb-2">Détails du prêt</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Taux d'intérêt annuel:</span>
                  <span className="text-green-400 font-semibold">
                    {isCampaignLoading ? '...' : (campaignData ? `${campaignData.annualRate}%` : `${campaign.interestRate}%`)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Durée:</span>
                  <span className="text-white">{campaign.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Token de prêt:</span>
                  <span className="text-white">PSG</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Intérêts payés en:</span>
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
                {isLoading ? 'Transaction en cours...' : 'Prêter maintenant'}
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-400 space-y-2">
              {amount && parseFloat(amount) > parseFloat(formatPSGBalance(psgBalance as bigint || BigInt(0), tokenDecimals)) && (
                <div className="bg-red-900/20 border border-red-500/30 rounded p-2">
                  <p className="text-red-400">
                    ❌ Solde insuffisant. Vous avez {formatPSGBalance(psgBalance as bigint || BigInt(0), tokenDecimals)} PSG disponibles.
                  </p>
                </div>
              )}
              
              <p className="text-center">
                En cliquant sur "Prêter maintenant", vous acceptez de transférer {amount || '...'} PSG 
                au smart contract pour la campagne #{campaignId}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Informations supplémentaires */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 p-6 mt-6">
        <h3 className="text-lg font-bold text-white mb-4">Comment ça marche</h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-start space-x-3">
            <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
            <p>Vous prêtez des tokens PSG au club via le smart contract</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
            <p>Le club utilise les fonds pour ses besoins (matériel, joueurs, etc.)</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
            <p>À la fin de la période, vous récupérez votre capital + intérêts en wCHZ</p>
          </div>
        </div>
      </div>
    </div>
  );
} 