import campaignsData from "../data/campaigns.json";
import { getEventSelector } from 'viem';
import { CONTRACTS, TWELFTH_MAN_ABI } from "../config/contracts";

export interface Campaign {
  id: number;
  clubName: string;
  league?: string;
  targetAmount: number;
  currentAmount: number;
  interestRate: number;
  duration: string;
  endDate: string;
  description: string;
  clubLogo: string;
  backers: number;
  daysLeft: number;
}

export async function getAllCampaigns(publicClient?: any): Promise<Campaign[]> {
  try {
    // Commencer avec les données JSON statiques
    let allCampaigns: Campaign[] = [...campaignsData];
    
    // Récupérer les IDs des campagnes JSON existantes
    const existingIds = new Set(campaignsData.map(c => c.id));
    
    // Essayer de récupérer les nouvelles campagnes depuis la blockchain
    if (publicClient) {
      try {
        const eventSelector = getEventSelector(
          'CampaignCreated(uint256,address,string,uint256,uint256,uint256,uint256)'
        );
        const logs = await publicClient.getLogs({
          address: CONTRACTS.TWELFTH_MAN as `0x${string}`,
          event: {
            type: 'event',
            name: 'CampaignCreated',
            inputs: [
              { indexed: true, name: 'campaignId', type: 'uint256' },
              { indexed: true, name: 'clubOwner', type: 'address' },
              { indexed: false, name: 'clubName', type: 'string' },
              { indexed: false, name: 'targetAmount', type: 'uint256' },
              { indexed: false, name: 'annualInterestRate', type: 'uint256' },
              { indexed: false, name: 'duration', type: 'uint256' },
              { indexed: false, name: 'deadline', type: 'uint256' },
            ],
          },
          fromBlock: 'earliest',
          toBlock: 'latest',
        });
        
        // Identifier les nouvelles campagnes (non présentes dans le JSON)
        const campaignIds: number[] = logs.map((log: any) => {
          const campaignId = log.args?.campaignId;
          return campaignId ? Number(campaignId) : 0;
        }).filter((id: number) => id > 0);
        
        const newCampaignIds = Array.from(new Set(campaignIds))
          .filter(id => !existingIds.has(id));
        
        // Récupérer les informations des nouvelles campagnes
        const newCampaigns = await Promise.all(
          newCampaignIds.map(async (id) => {
            try {
              const info = await publicClient.readContract({
                address: CONTRACTS.TWELFTH_MAN as `0x${string}`,
                abi: TWELFTH_MAN_ABI,
                functionName: 'getCampaignInfo',
                args: [BigInt(id)],
              });
              
              // Convertir les données blockchain au format JSON
              const deadline = Number(info[5] || BigInt(0));
              const currentTime = Math.floor(Date.now() / 1000);
              const daysLeft = deadline > currentTime ? Math.ceil((deadline - currentTime) / (24 * 60 * 60)) : 0;
              
              return {
                id,
                clubName: info[1] || 'Nouveau Club',
                targetAmount: Number(info[2] || BigInt(0)) / Math.pow(10, 18), // Convertir depuis wei
                currentAmount: Number(info[3] || BigInt(0)) / Math.pow(10, 18),
                interestRate: Number(info[4] || BigInt(0)) / 100,
                duration: `${Math.floor(Number(info[6] || BigInt(0)) / (24 * 60 * 60))} jours`,
                endDate: deadline ? new Date(deadline * 1000).toISOString().split('T')[0] : '2025-12-31',
                description: `Campagne créée par ${info[1] || 'Club inconnu'} - Nouvelle opportunité d'investissement`,
                clubLogo: '/logo/PSG.png', // Logo par défaut
                backers: Number(info[10] || BigInt(0)),
                daysLeft: daysLeft
              };
            } catch (e) {
              console.error(`Erreur lors de la récupération de la campagne ${id}:`, e);
              return null;
            }
          })
        );
        
        // Ajouter les nouvelles campagnes à la fin de la liste (après les campagnes statiques)
        const validNewCampaigns = newCampaigns.filter((campaign): campaign is Campaign => campaign !== null);
        if (validNewCampaigns.length > 0) {
          allCampaigns = [...allCampaigns, ...validNewCampaigns];
        }
      } catch (blockchainError) {
        console.log('Impossible de récupérer les campagnes blockchain, utilisation des données JSON uniquement');
      }
    }
    
    return allCampaigns;
  } catch (e) {
    console.error('Erreur lors du chargement des campagnes:', e);
    // En cas d'erreur, utiliser uniquement les données JSON
    return campaignsData;
  }
} 