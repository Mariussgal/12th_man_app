import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

// Définir la chaîne Chiliz Testnet avec plusieurs RPC de secours
export const chilizTestnet = defineChain({
  id: 88882,
  name: 'Chiliz Spicy Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Chiliz',
    symbol: 'CHZ',
  },
  rpcUrls: {
    default: {
      http: [
        'https://spicy-rpc.chiliz.com',
        'https://chiliz-spicy.publicnode.com',
        'https://spicy.chiliz-rpc.com'
      ],
    },
    public: {
      http: [
        'https://spicy-rpc.chiliz.com',
        'https://chiliz-spicy.publicnode.com'
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Chiliz Explorer',
      url: 'https://testnet.chiliscan.com',
    },
  },
  testnet: true,
});

// Configuration wagmi avec RainbowKit et options améliorées
export const config = getDefaultConfig({
  appName: 'TwelfthMan - Football Club Lending',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Remplacez par votre project ID WalletConnect
  chains: [chilizTestnet],
  ssr: true, // Si vous utilisez SSR
}); 