import mockData from '../data/mockContributors.json';

export interface MockLeaderboardEntry {
  address: string;
  amount: number;
  amountUSD: number;
  rank: number;
}

// Fonction pour mélanger un array avec une seed spécifique (pour reproduire le même ordre)
function shuffleWithSeed<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let currentIndex = shuffled.length;
  let randomIndex;

  // Générateur de nombres pseudo-aléatoires avec seed
  function seededRandom() {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  while (currentIndex !== 0) {
    randomIndex = Math.floor(seededRandom() * currentIndex);
    currentIndex--;

    [shuffled[currentIndex], shuffled[randomIndex]] = [
      shuffled[randomIndex], shuffled[currentIndex]
    ];
  }

  return shuffled;
}

// Prix PSG fictif en USD (tu peux ajuster)
const PSG_PRICE_USD = 1.2;

// Fonction pour générer le leaderboard d'un club spécifique
export function generateMockLeaderboard(campaignId: number): MockLeaderboardEntry[] {
  const clubConfig = mockData.clubVariations[campaignId.toString() as keyof typeof mockData.clubVariations];
  
  if (!clubConfig) {
    // Si le club n'est pas configuré, retourner un array vide
    return [];
  }

  // Mélanger les contributeurs avec la seed du club
  const shuffledContributors = shuffleWithSeed(mockData.contributors, clubConfig.shuffleSeed);
  
  // Appliquer le multiplier et créer le leaderboard
  const leaderboard: MockLeaderboardEntry[] = shuffledContributors.map((contributor, index) => {
    const adjustedAmount = Math.floor(contributor.amount * clubConfig.multiplier);
    const amountUSD = adjustedAmount * PSG_PRICE_USD;
    
    return {
      address: contributor.address,
      amount: adjustedAmount,
      amountUSD: amountUSD,
      rank: index + 1
    };
  });

  // Trier par montant décroissant (au cas où le multiplier changerait l'ordre)
  leaderboard.sort((a, b) => b.amount - a.amount);
  
  // Réassigner les rangs après le tri
  leaderboard.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return leaderboard;
}

// Fonction pour obtenir les stats d'un club
export function getMockClubStats(campaignId: number) {
  const leaderboard = generateMockLeaderboard(campaignId);
  
  if (leaderboard.length === 0) {
    return {
      totalContributors: 0,
      totalAmount: 0,
      totalAmountUSD: 0,
      averageContribution: 0,
      averageContributionUSD: 0
    };
  }

  const totalAmount = leaderboard.reduce((sum, entry) => sum + entry.amount, 0);
  const totalAmountUSD = leaderboard.reduce((sum, entry) => sum + entry.amountUSD, 0);
  
  return {
    totalContributors: leaderboard.length,
    totalAmount,
    totalAmountUSD,
    averageContribution: Math.floor(totalAmount / leaderboard.length),
    averageContributionUSD: totalAmountUSD / leaderboard.length
  };
}

// Fonction pour obtenir les stats globales (tous les clubs avec des données mock)
export function getMockGlobalStats() {
  const clubIds = Object.keys(mockData.clubVariations).map(Number);
  
  let totalContributors = 0;
  let totalAmount = 0;
  let totalAmountUSD = 0;

  clubIds.forEach(clubId => {
    const stats = getMockClubStats(clubId);
    totalContributors += stats.totalContributors;
    totalAmount += stats.totalAmount;
    totalAmountUSD += stats.totalAmountUSD;
  });

  return {
    totalContributors,
    totalAmount,
    totalAmountUSD,
    averageContribution: totalContributors > 0 ? Math.floor(totalAmount / totalContributors) : 0,
    averageContributionUSD: totalContributors > 0 ? totalAmountUSD / totalContributors : 0,
    totalClubs: clubIds.length
  };
}

// Fonction utilitaire pour formater les montants
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatAmountUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Fonction pour formater les adresses
export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}