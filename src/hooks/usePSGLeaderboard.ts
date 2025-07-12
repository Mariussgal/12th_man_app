import { useMemo } from 'react';
import { useReadContract } from 'wagmi';
import { CONTRACTS, TWELFTH_MAN_ABI } from '../config/contracts';

export interface PSGLeaderboardEntry {
  address: string;
  amount: number;
  amountUSD: number;
  rank: number;
}

export interface PSGStats {
  totalContributors: number;
  totalAmount: number;
  totalAmountUSD: number;
  averageContribution: number;
  averageContributionUSD: number;
}

// Prix PSG en USD (1 PSG = 1 USD)
const PSG_PRICE_USD = 1.0;

// Hook spécialisé pour récupérer le leaderboard PSG depuis le smart contract
export function usePSGLeaderboard() {
  const PSG_CAMPAIGN_ID = 1;
  
  // Récupérer les informations de campagne PSG pour les stats
  const { data: campaignInfo, isLoading: isStatsLoading, error: statsError, refetch } = useReadContract({
    address: CONTRACTS.TWELFTH_MAN as `0x${string}`,
    abi: TWELFTH_MAN_ABI,
    functionName: 'getCampaignInfo',
    args: [BigInt(PSG_CAMPAIGN_ID)],
  });

  // Récupérer le top 10 des contributeurs PSG avec leurs montants 
  const { data: topContributorsData, isLoading: isLeaderboardLoading, error: leaderboardError } = useReadContract({
    address: CONTRACTS.TWELFTH_MAN as `0x${string}`,
    abi: TWELFTH_MAN_ABI,
    functionName: 'getTopContributors',
    args: [BigInt(PSG_CAMPAIGN_ID), BigInt(10)], // Top 10 contributeurs
    query: { enabled: !!campaignInfo } // Attendre que les stats soient chargées
  });

  // Créer le leaderboard depuis les données du smart contract
  const leaderboard = useMemo((): PSGLeaderboardEntry[] => {
    if (!topContributorsData || isLeaderboardLoading) {
      return [];
    }

    const [contributors, amounts] = topContributorsData as [string[], bigint[]];
    
    if (!contributors || !amounts || contributors.length === 0) {
      return [];
    }

    // Convertir en format leaderboard
    const leaderboardEntries: PSGLeaderboardEntry[] = contributors.map((address, index) => {
      const amountBigInt = amounts[index] || BigInt(0);
      const amountPSG = formatPSGAmount(amountBigInt);
      const amountUSD = amountPSG * PSG_PRICE_USD;

      return {
        address,
        amount: amountPSG,
        amountUSD,
        rank: index + 1 // Déjà trié par le smart contract 
      };
    });

    return leaderboardEntries;
  }, [topContributorsData, isLeaderboardLoading]);

  // Extraire les stats de la campagne PSG
  const stats = useMemo((): PSGStats => {
    if (!campaignInfo || isStatsLoading) {
      return {
        totalContributors: 0,
        totalAmount: 0,
        totalAmountUSD: 0,
        averageContribution: 0,
        averageContributionUSD: 0
      };
    }

    const contributorsCount = Number(campaignInfo[10] || BigInt(0));
    const rawCollectedAmount = campaignInfo[3] || BigInt(0);
    
    const collectedAmountPSG = formatPSGAmount(rawCollectedAmount);
    const collectedAmountUSD = collectedAmountPSG * PSG_PRICE_USD;
    
    const avgContribution = contributorsCount > 0 ? collectedAmountPSG / contributorsCount : 0;
          const avgContributionUSD = avgContribution * PSG_PRICE_USD;

      return {
      totalContributors: contributorsCount,
      totalAmount: collectedAmountPSG,
      totalAmountUSD: collectedAmountUSD,
      averageContribution: avgContribution,
      averageContributionUSD: avgContributionUSD
    };
  }, [campaignInfo, isStatsLoading]);

  const isLoading = isStatsLoading || isLeaderboardLoading;
    const error = statsError?.message || leaderboardError?.message || null;

  return {
    leaderboard,
    stats,
    isLoading,
    error,
    refetch,
    hasData: stats.totalContributors > 0 || leaderboard.length > 0
  };
}

// Fonction utilitaire pour convertir les montants PSG du smart contract
function formatPSGAmount(amount: bigint): number {
  if (amount === BigInt(0)) return 0;
  
  // Les montants PSG sont stockés comme des nombres entiers simples dans le smart contract
  // Exemple: 40 PSG = BigInt(40), 2 PSG = BigInt(2)
  const result = Number(amount);
  
  return result;
}

// Hook pour formater une adresse (réutilisable)
export function useFormattedAddress(address: string) {
  return useMemo(() => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);
}