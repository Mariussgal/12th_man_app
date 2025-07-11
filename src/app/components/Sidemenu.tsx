"use client";

import { useState } from "react";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Sidemenu = () => {
  const [activeItem, setActiveItem] = useState("Home");
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  
  // Récupérer le solde ETH
  const { data: balance } = useBalance({
    address: address,
  });

  const menuItems = [
    {
      name: "Home",
      path: "/",
    },
    {
      name: "Leaderboard",
      path: "/leaderboard",
    },
    {
      name: "Profile",
      path: "/profile",
    },
    {
      name: "How it works",
      path: "/how-it-works",
    },

  ];

  // Fonction pour formater l'adresse
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-3)}`;
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-transparent flex flex-col z-40 font-sans">
      {/* Logo/Header */}
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-bold text-white font-sans">12th Man</h1>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 mt-40">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => setActiveItem(item.name)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 font-sans ${
                  activeItem === item.name
                    ? "bg-white/10 backdrop-blur-md text-white "
                    : "text-gray-300 hover:text-white hover:bg-white/5 hover:backdrop-blur-sm"
                }`}
              >
                <span className="font-medium">{item.name}</span>
      
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom User Info */}
      <div className="p-4 border-t border-gray-800">
        {isConnected && address ? (
          // Wallet connecté - affichage des informations
          <div 
            className="flex items-center space-x-3 p-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 font-sans cursor-pointer hover:bg-white/15 transition-all"
            onClick={() => disconnect()}
            title="Cliquer pour se déconnecter"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold font-sans">✓</span>
            </div>
            <div className="flex-1">
              <div className="text-white font-medium text-sm font-sans">{formatAddress(address)}</div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-600 rounded-sm flex items-center justify-center">
                  <span className="text-xs font-sans">◆</span>
                </div>
                <span className="text-gray-400 text-sm font-sans">
                  {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '0.00'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          // Wallet non connecté - bouton de connexion avec design custom
          <div className="relative">
            {/* Bouton custom avec le design du sidemenu */}
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 font-sans">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold font-sans">$</span>
              </div>
              <div className="flex-1">
                <div className="text-white font-medium text-sm font-sans">Non connecté</div>
                <div className="text-gray-400 text-sm font-sans">Cliquer pour connecter</div>
              </div>
            </div>
            
            {/* ConnectButton invisible positionné par-dessus */}
            <div className="absolute inset-0 opacity-0">
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button
                    onClick={openConnectModal}
                    className="w-full h-full"
                  />
                )}
              </ConnectButton.Custom>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidemenu; 