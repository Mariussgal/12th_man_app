// Configuration des contrats pour TwelfthMan
export const CONTRACTS = {
  TWELFTH_MAN: "0x6c88fe779c1F66908107E87D13700fD1B31657E5", // Votre adresse de contrat TwelfthMan déployé
  
  // Adresses des tokens sur Chiliz Spicy Testnet (88882)
  USDC_TOKEN: "0xb0Fa395a3386800658B9617F90e834E2CeC76Dd3", // Token USDC pour les prêts
  WCHZ_TOKEN: "0x678c34581db0a7808d0aC669d7025f1408C9a3C6", // Wrapped CHZ pour les intérêts
};

// Configuration du réseau Chiliz Spicy Testnet
export const CHILIZ_TESTNET = {
  chainId: 88882,
  name: "Chiliz Spicy Testnet",
  rpcUrl: "https://spicy-rpc.chiliz.com",
  blockExplorer: "https://testnet.chiliscan.com",
  nativeCurrency: {
    name: "Chiliz",
    symbol: "CHZ",
    decimals: 18,
  },
};

// ABI complet du smart contract TwelfthMan
export const TWELFTH_MAN_ABI = [
  // ===== FONCTIONS PRINCIPALES =====
  {
    "inputs": [
      { "internalType": "string", "name": "_clubName", "type": "string" },
      { "internalType": "uint256", "name": "_targetAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "_annualInterestRate", "type": "uint256" },
      { "internalType": "uint256", "name": "_deadline", "type": "uint256" },
      { "internalType": "uint256", "name": "_loanDuration", "type": "uint256" }
    ],
    "name": "createCampaign",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_campaignId", "type": "uint256"},
      {"internalType": "uint256", "name": "_amount", "type": "uint256"}
    ],
    "name": "contribute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_campaignId", "type": "uint256"}],
    "name": "claimRefund",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_campaignId", "type": "uint256"}],
    "name": "withdrawFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // ===== FONCTIONS DE LECTURE - INFOS CAMPAGNE =====
  {
    "inputs": [{"internalType": "uint256", "name": "_campaignId", "type": "uint256"}],
    "name": "getCampaignInfo",
    "outputs": [
      {"internalType": "address", "name": "clubOwner", "type": "address"},
      {"internalType": "string", "name": "clubName", "type": "string"},
      {"internalType": "uint256", "name": "targetAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "collectedAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "annualInterestRate", "type": "uint256"},
      {"internalType": "uint256", "name": "deadline", "type": "uint256"},
      {"internalType": "uint256", "name": "loanDuration", "type": "uint256"},
      {"internalType": "uint256", "name": "loanStartTime", "type": "uint256"},
      {"internalType": "bool", "name": "isActive", "type": "bool"},
      {"internalType": "bool", "name": "isCompleted", "type": "bool"},
      {"internalType": "uint256", "name": "contributorsCount", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_campaignId", "type": "uint256"}],
    "name": "getCampaignStatus",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_campaignId", "type": "uint256"}],
    "name": "getRemainingAmount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_campaignId", "type": "uint256"}],
    "name": "getTimeRemaining",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_campaignId", "type": "uint256"}],
    "name": "getCampaignFundingDuration",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_campaignId", "type": "uint256"}],
    "name": "getLoanDuration",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_campaignId", "type": "uint256"}],
    "name": "getLoanEndTime",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_campaignId", "type": "uint256"}],
    "name": "getLoanTimeRemaining",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },

  // ===== FONCTIONS DE VÉRIFICATION =====
  {
    "inputs": [{"internalType": "uint256", "name": "_campaignId", "type": "uint256"}],
    "name": "canContribute",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_campaignId", "type": "uint256"},
      {"internalType": "address", "name": "_contributor", "type": "address"}
    ],
    "name": "canClaimRefund",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_campaignId", "type": "uint256"}],
    "name": "isLoanActive",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },

  // ===== FONCTIONS DE CONTRIBUTIONS =====
  {
    "inputs": [
      {"internalType": "uint256", "name": "_campaignId", "type": "uint256"},
      {"internalType": "address", "name": "_contributor", "type": "address"}
    ],
    "name": "getContribution",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_campaignId", "type": "uint256"}],
    "name": "getContributors",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_campaignId", "type": "uint256"}],
    "name": "getContributorsWithAmounts",
    "outputs": [
      {"internalType": "address[]", "name": "contributors", "type": "address[]"},
      {"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_campaignId", "type": "uint256"},
      {"internalType": "uint256", "name": "_topN", "type": "uint256"}
    ],
    "name": "getTopContributors",
    "outputs": [
      {"internalType": "address[]", "name": "contributors", "type": "address[]"},
      {"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  },

  // ===== FONCTIONS DE CALCUL D'INTÉRÊTS =====
  {
    "inputs": [
      {"internalType": "uint256", "name": "_principal", "type": "uint256"},
      {"internalType": "uint256", "name": "_annualRate", "type": "uint256"},
      {"internalType": "uint256", "name": "_startTime", "type": "uint256"},
      {"internalType": "uint256", "name": "_endTime", "type": "uint256"}
    ],
    "name": "calculateInterest",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_campaignId", "type": "uint256"}],
    "name": "calculateCampaignInterest",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_campaignId", "type": "uint256"},
      {"internalType": "address", "name": "_investor", "type": "address"}
    ],
    "name": "calculateInvestorInterests",
    "outputs": [
      {"internalType": "uint256", "name": "currentInterest", "type": "uint256"},
      {"internalType": "uint256", "name": "totalInterest", "type": "uint256"},
      {"internalType": "uint256", "name": "dailyInterest", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_campaignId", "type": "uint256"},
      {"internalType": "address", "name": "_investor", "type": "address"}
    ],
    "name": "getInvestorReturns",
    "outputs": [
      {"internalType": "uint256", "name": "principal", "type": "uint256"},
      {"internalType": "uint256", "name": "currentInterest", "type": "uint256"},
      {"internalType": "uint256", "name": "totalExpected", "type": "uint256"},
      {"internalType": "uint256", "name": "currentTotal", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_campaignId", "type": "uint256"},
      {"internalType": "address", "name": "_investor", "type": "address"}
    ],
    "name": "getInvestorStats",
    "outputs": [
      {"internalType": "uint256", "name": "contribution", "type": "uint256"},
      {"internalType": "uint256", "name": "contributionPercentage", "type": "uint256"},
      {"internalType": "uint256", "name": "currentInterest", "type": "uint256"},
      {"internalType": "uint256", "name": "totalInterestExpected", "type": "uint256"},
      {"internalType": "uint256", "name": "dailyInterest", "type": "uint256"},
      {"internalType": "uint256", "name": "daysElapsed", "type": "uint256"},
      {"internalType": "uint256", "name": "daysRemaining", "type": "uint256"},
      {"internalType": "string", "name": "status", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_campaignId", "type": "uint256"},
      {"internalType": "address", "name": "_investor", "type": "address"}
    ],
    "name": "getCurrentAPY",
    "outputs": [{"internalType": "uint256", "name": "currentAPY", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },

  // ===== FONCTIONS DE GESTION D'UTILISATEURS =====
  {
    "inputs": [{"internalType": "address", "name": "_contributor", "type": "address"}],
    "name": "getUserContributions",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_clubOwner", "type": "address"}],
    "name": "getClubCampaigns",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },

  // ===== FONCTIONS UTILITAIRES =====
  {
    "inputs": [{"internalType": "uint256", "name": "percent", "type": "uint256"}],
    "name": "percentToBasisPoints",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "timestamp", "type": "uint256"}],
    "name": "timestampToDate",
    "outputs": [
      {"internalType": "uint256", "name": "year", "type": "uint256"},
      {"internalType": "uint256", "name": "month", "type": "uint256"},
      {"internalType": "uint256", "name": "day", "type": "uint256"}
    ],
    "stateMutability": "pure",
    "type": "function"
  },

  // ===== VARIABLES PUBLIQUES =====
  {
    "inputs": [],
    "name": "campaignCounter",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "USDC",
    "outputs": [{"internalType": "contract IERC20", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "wCHZ",
    "outputs": [{"internalType": "contract IERC20", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MIN_CAMPAIGN_DURATION",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_CAMPAIGN_DURATION",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MIN_LOAN_DURATION",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_LOAN_DURATION",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_INTEREST_RATE",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MIN_TARGET",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },

  // ===== ÉVÉNEMENTS =====
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "campaignId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "clubOwner", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "clubName", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "targetAmount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "annualInterestRate", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "deadline", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "loanDuration", "type": "uint256"}
    ],
    "name": "CampaignCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "campaignId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "contributor", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "ContributionMade",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "campaignId", "type": "uint256"}
    ],
    "name": "CampaignCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "campaignId", "type": "uint256"}
    ],
    "name": "CampaignFailed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "campaignId", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "FundsWithdrawn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "campaignId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "contributor", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "RefundClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "campaignId", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "principalAmount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "interestAmount", "type": "uint256"}
    ],
    "name": "LoanRepaid",
    "type": "event"
  }
] as const;

// ABI pour les tokens ERC20 (USDC et wCHZ)
export const ERC20_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "address", "name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "from", "type": "address"},
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "transferFrom",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Types TypeScript pour une meilleure intégration
export type CampaignInfo = {
  clubOwner: string;
  clubName: string;
  targetAmount: bigint;
  collectedAmount: bigint;
  annualInterestRate: bigint;
  deadline: bigint;
  loanDuration: bigint;
  loanStartTime: bigint;
  isActive: boolean;
  isCompleted: boolean;
  contributorsCount: bigint;
};

export type InvestorStats = {
  contribution: bigint;
  contributionPercentage: bigint;
  currentInterest: bigint;
  totalInterestExpected: bigint;
  dailyInterest: bigint;
  daysElapsed: bigint;
  daysRemaining: bigint;
  status: string;
};

export type InvestorReturns = {
  principal: bigint;
  currentInterest: bigint;
  totalExpected: bigint;
  currentTotal: bigint;
};

// Constantes utiles
export const CAMPAIGN_CONSTANTS = {
  MIN_CAMPAIGN_DURATION: 7 * 24 * 60 * 60, // 7 jours en secondes
  MAX_CAMPAIGN_DURATION: 90 * 24 * 60 * 60, // 90 jours en secondes
  MIN_LOAN_DURATION: 30 * 24 * 60 * 60, // 30 jours en secondes
  MAX_LOAN_DURATION: 1095 * 24 * 60 * 60, // 3 ans en secondes
  MAX_INTEREST_RATE: 10000, // 100% en basis points
  MIN_TARGET: BigInt(100) * BigInt(10**18), // 100 USDC minimum
  BASIS_POINTS_DIVISOR: 10000,
} as const;

// Fonctions utilitaires
export const formatters = {
  // Convertir des basis points en pourcentage
  basisPointsToPercent: (basisPoints: bigint): number => {
    return Number(basisPoints) / 100;
  },
  
  // Convertir un pourcentage en basis points
  percentToBasisPoints: (percent: number): bigint => {
    return BigInt(Math.floor(percent * 100));
  },
  
  // Formater les montants USDC (18 décimales)
  formatUSDC: (amount: bigint): string => {
    return (Number(amount) / 10**18).toFixed(2);
  },
  
  // Parser les montants USDC
  parseUSDC: (amount: string): bigint => {
    return BigInt(Math.floor(parseFloat(amount) * 10**18));
  },
  
  // Formater les durées
  formatDuration: (seconds: bigint): string => {
    const days = Number(seconds) / (24 * 60 * 60);
    if (days >= 365) {
      return `${Math.floor(days / 365)} an${Math.floor(days / 365) > 1 ? 's' : ''}`;
    } else if (days >= 30) {
      return `${Math.floor(days / 30)} mois`;
    } else {
      return `${Math.floor(days)} jour${Math.floor(days) > 1 ? 's' : ''}`;
    }
  },
  
  // Formater les timestamps
  formatTimestamp: (timestamp: bigint): string => {
    return new Date(Number(timestamp) * 1000).toLocaleString('fr-FR');
  }
} as const;
