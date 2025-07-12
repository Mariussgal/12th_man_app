// Configuration des contrats pour TwelfthMan
export const CONTRACTS = {
  // ⚠️ REMPLACEZ CETTE ADRESSE PAR VOTRE CONTRAT DÉPLOYÉ SUR CHILIZ TESTNET
  TWELFTH_MAN: "0x1D433F6fDAB22Ea9A4267F74841B4AAA0F5957F4", // Votre adresse de contrat TwelfthMan déployé
  
  // Adresses des tokens sur Chiliz Spicy Testnet (88882)
<<<<<<< Updated upstream
  // ⚠️ VÉRIFIEZ CES ADRESSES - elles peuvent être différentes sur Spicy Testnet
  PSG_TOKEN: "0xb0Fa395a3386800658B9617F90e834E2CeC76Dd3", // À vérifier
=======
  USDC_TOKEN: "0xb0Fa395a3386800658B9617F90e834E2CeC76Dd3", // À vérifier
>>>>>>> Stashed changes
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

// ABI complet pour les fonctions principales
export const TWELFTH_MAN_ABI = [
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
  }
] as const;

// ABI étendu pour le token USDC (fonctions ERC20 + debug)
export const USDC_TOKEN_ABI = [
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