import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { CONTRACTS, TWELFTH_MAN_ABI } from '../config/contracts';

export interface ContributionEvent {
  contributor: string;
  campaignId: number;
  amount: bigint;
  blockNumber: bigint;
  transactionHash: string;
  timestamp?: number;
}

export interface LeaderboardEntry {
  address: string;
  totalAmount: bigint;
  contributionCount: number;
  rank: number;
}

// Hook pour récupérer les événements de contribution pour une campagne
export function useContributionEvents(campaignId: number | null) {
  const [events, setEvents] = useState<ContributionEvent[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const publicClient = usePublicClient();

  useEffect(() => {
    if (!campaignId || !publicClient) return;

    const fetchContributionEvents = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching contribution events for campaign ${campaignId}...`);
        
        // Récupérer les événements depuis les logs
        // On cherche les événements "Contribution" du smart contract
        const logs = await publicClient.getLogs({
          address: CONTRACTS.TWELFTH_MAN as `0x${string}`,
          // Event signature pour Contribution(address indexed contributor, uint256 indexed campaignId, uint256 amount)
          // Keccak256 hash de "Contribution(address,uint256,uint256)"
          event: {
            type: 'event',
            name: 'Contribution',
            inputs: [
              { type: 'address', name: 'contributor', indexed: true },
              { type: 'uint256', name: 'campaignId', indexed: true },
              { type: 'uint256', name: 'amount', indexed: false }
            ]
          },
          args: {
            campaignId: BigInt(campaignId)
          },
          fromBlock: 'earliest',
          toBlock: 'latest'
        });

        console.log(`Found ${logs.length} contribution events for campaign ${campaignId}`);

        // Parser les événements
        const parsedEvents: ContributionEvent[] = logs.map((log) => ({
          contributor: log.args.contributor as string,
          campaignId: Number(log.args.campaignId),
          amount: log.args.amount as bigint,
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
        }));

        // Trier par montant décroissant
        parsedEvents.sort((a, b) => Number(b.amount - a.amount));

        setEvents(parsedEvents);

        // Créer le leaderboard en agrégeant par adresse
        const contributorMap = new Map<string, { totalAmount: bigint; count: number }>();
        
        parsedEvents.forEach(event => {
          const existing = contributorMap.get(event.contributor);
          if (existing) {
            contributorMap.set(event.contributor, {
              totalAmount: existing.totalAmount + event.amount,
              count: existing.count + 1
            });
          } else {
            contributorMap.set(event.contributor, {
              totalAmount: event.amount,
              count: 1
            });
          }
        });

        // Convertir en array et trier
        const leaderboardEntries: LeaderboardEntry[] = Array.from(contributorMap.entries())
          .map(([address, data]) => ({
            address,
            totalAmount: data.totalAmount,
            contributionCount: data.count,
            rank: 0 // On va assigner le rang après le tri
          }))
          .sort((a, b) => Number(b.totalAmount - a.totalAmount))
          .map((entry, index) => ({
            ...entry,
            rank: index + 1
          }));

        setLeaderboard(leaderboardEntries);
        console.log(`Leaderboard created with ${leaderboardEntries.length} unique contributors`);

      } catch (err) {
        console.error('Error fetching contribution events:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch contribution events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContributionEvents();
  }, [campaignId, publicClient]);

  return {
    events,
    leaderboard,
    isLoading,
    error,
    refetch: () => {
      if (campaignId && publicClient) {
        // Déclencher un nouveau fetch
        setIsLoading(true);
      }
    }
  };
}

// Hook pour récupérer tous les événements de contribution (pour stats globales)
export function useAllContributionEvents() {
  const [totalContributors, setTotalContributors] = useState(0);
  const [totalAmount, setTotalAmount] = useState<bigint>(BigInt(0));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const publicClient = usePublicClient();

  useEffect(() => {
    if (!publicClient) return;

    const fetchAllEvents = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching all contribution events...');
        
        const logs = await publicClient.getLogs({
          address: CONTRACTS.TWELFTH_MAN as `0x${string}`,
          event: {
            type: 'event',
            name: 'Contribution', 
            inputs: [
              { type: 'address', name: 'contributor', indexed: true },
              { type: 'uint256', name: 'campaignId', indexed: true },
              { type: 'uint256', name: 'amount', indexed: false }
            ]
          },
          fromBlock: 'earliest',
          toBlock: 'latest'
        });

        console.log(`Found ${logs.length} total contribution events`);

        // Compter les contributeurs uniques
        const uniqueContributors = new Set<string>();
        let total = BigInt(0);

        logs.forEach(log => {
          uniqueContributors.add(log.args.contributor as string);
          total += log.args.amount as bigint;
        });

        setTotalContributors(uniqueContributors.size);
        setTotalAmount(total);

      } catch (err) {
        console.error('Error fetching all contribution events:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch all contribution events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllEvents();
  }, [publicClient]);

  return {
    totalContributors,
    totalAmount,
    isLoading,
    error
  };
}