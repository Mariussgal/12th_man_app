// Configuration des contrats pour TwelfthMan
export const CONTRACTS = {
  TWELFTH_MAN: "0x90D3d31175b47801ea55d010629B25726aE0AD53", // Votre adresse de contrat TwelfthMan déployé
  
  // Adresses des tokens sur Chiliz Spicy Testnet (88882)
  PSG_TOKEN: "0xb0Fa395a3386800658B9617F90e834E2CeC76Dd3", // À vérifier
  WCHZ_TOKEN: "0x678c34581db0a7808d0aC669d7025f1408C9a3C6", // À vérifier
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

// ABI complet avec toutes les nouvelles fonctions du smart contract
export const TWELFTH_MAN_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "_clubName", "type": "string" },
      { "internalType": "uint256", "name": "_targetAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "_annualInterestRate", "type": "uint256" },
      { "internalType": "uint256", "name": "_duration", "type": "uint256" }
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
    "name": "getCampaignInfo",
    "outputs": [
      {"internalType": "address", "name": "clubOwner", "type": "address"},
      {"internalType": "string", "name": "clubName", "type": "string"},
      {"internalType": "uint256", "name": "targetAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "collectedAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "annualInterestRate", "type": "uint256"},
      {"internalType": "uint256", "name": "deadline", "type": "uint256"},
      {"internalType": "bool", "name": "isActive", "type": "bool"},
      {"internalType": "bool", "name": "isCompleted", "type": "bool"},
      {"internalType": "uint256", "name": "contributorsCount", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
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
    "name": "canContribute",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
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
    "inputs": [
      {"internalType": "uint256", "name": "_principal", "type": "uint256"},
      {"internalType": "uint256", "name": "_annualRate", "type": "uint256"},
      {"internalType": "uint256", "name": "_duration", "type": "uint256"}
    ],
    "name": "calculateInterest",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_contributor", "type": "address"}],
    "name": "getUserContributions",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
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
    "name": "claimRefund",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_campaignId", "type": "uint256"}],
    "name": "getCampaignStatus",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  // ===== NOUVELLES FONCTIONS AJOUTÉES =====
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
  {
    "inputs": [{"internalType": "address", "name": "_clubOwner", "type": "address"}],
    "name": "getClubCampaigns",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "percent", "type": "uint256"}],
    "name": "percentToBasisPoints",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_campaignId", "type": "uint256"}],
    "name": "withdrawFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
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
      {"indexed": false, "internalType": "uint256", "name": "duration", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "deadline", "type": "uint256"}
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

// ABI étendu pour le token PSG (fonctions ERC20 + debug)
export const PSG_TOKEN_ABI = [
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