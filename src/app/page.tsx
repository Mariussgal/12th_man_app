"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import campaignsData from "../data/campaigns.json";
import Link from "next/link";
import { useReadContract, usePublicClient } from 'wagmi';
import { getEventSelector } from 'viem';
import { CONTRACTS, TWELFTH_MAN_ABI, ERC20_ABI } from "../config/contracts";

export default function Home() {
  const publicClient = usePublicClient();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [flippedCards, setFlippedCards] = useState<{[key: number]: boolean}>({});
  const [showDescription, setShowDescription] = useState<{[key: number]: boolean}>({});
  const [campaignImages, setCampaignImages] = useState<{[key: number]: string}>({});
  const [campaignDescriptions, setCampaignDescriptions] = useState<{[key: number]: string}>({});

  // Version hybride : utilise les données JSON comme base et ajoute les nouvelles campagnes blockchain
  useEffect(() => {
    async function fetchCampaigns() {
      setLoadingCampaigns(true);
      try {
        // Commencer avec les données JSON simulées
        let allCampaigns = [...campaignsData];
        
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
            const newCampaignIds = Array.from(new Set(logs.map(log => Number(log.args.campaignId))))
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
                    league: 'Ligue 1',
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
            
                                     // Ajouter les nouvelles campagnes à la fin de la liste (après les campagnes simulées)
            const validNewCampaigns = newCampaigns.filter((campaign): campaign is NonNullable<typeof campaign> => campaign !== null);
            if (validNewCampaigns.length > 0) {
              allCampaigns = [...allCampaigns, ...validNewCampaigns];
            }
          } catch (blockchainError) {
            console.log('Impossible de récupérer les campagnes blockchain, utilisation des données JSON uniquement');
          }
        }
        
        setCampaigns(allCampaigns);
      } catch (e) {
        console.error('Erreur lors du chargement des campagnes:', e);
        // En cas d'erreur, utiliser uniquement les données JSON
        setCampaigns(campaignsData);
      } finally {
        setLoadingCampaigns(false);
      }
    }
    
    fetchCampaigns();
  }, [publicClient]);

  useEffect(() => {
    async function fetchImagesAndDescriptions() {
      console.log('fetchImagesAndDescriptions called with campaigns:', campaigns);
      
      const images: {[key: number]: string} = {};
      const descriptions: {[key: number]: string} = {};
      
      // Récupérer les images uniquement pour les nouvelles campagnes blockchain (pas pour les campagnes simulées)
      const campaignsToFetch = campaigns.filter(campaign => campaign.id < 1000); // Les campagnes simulées ont les IDs 1000+
      
      await Promise.all(
        campaignsToFetch.map(async (campaign) => {
          try {
            console.log(`Fetching data for campaign ${campaign.id}`);
            const res = await fetch(`/api/campaign-image?campaignId=${campaign.id}`);
            console.log(`Response for campaign ${campaign.id}:`, res.status);
            
            if (res.ok) {
              const data = await res.json();
              console.log(`Data for campaign ${campaign.id}:`, data);
              if (data.imageUrl) {
                images[campaign.id] = data.imageUrl;
              }
              if (data.description) {
                descriptions[campaign.id] = data.description;
              }
            } else {
              console.log(`No data found for campaign ${campaign.id}`);
            }
          } catch (e) {
            console.error(`Error fetching data for campaign ${campaign.id}:`, e);
          }
        })
      );
      
      console.log('Final images mapping:', images);
      console.log('Final descriptions mapping:', descriptions);
      setCampaignImages(images);
      setCampaignDescriptions(descriptions);
    }
    if (campaigns.length > 0) fetchImagesAndDescriptions();
  }, [campaigns]);

  const toggleFlip = (campaignId: number) => {
    setFlippedCards(prev => ({
      ...prev,
      [campaignId]: !prev[campaignId]
    }));
  };

  const toggleDescription = (campaignId: number) => {
    setShowDescription(prev => ({
      ...prev,
      [campaignId]: !prev[campaignId]
    }));
  };

  const getProgressPercentage = (current: number | bigint, target: number | bigint) => {
    const nCurrent = typeof current === 'bigint' ? Number(current) : current;
    const nTarget = typeof target === 'bigint' ? Number(target) : target;
    if (!nTarget || nTarget === 0) return 0;
    return Math.min((nCurrent / nTarget) * 100, 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Hook pour récupérer les informations des campagnes (utilise JSON comme source principale)
  const CampaignInfo = ({ campaignId, children }: { 
    campaignId: number, 
    children: (data: { 
      contributorsCount: number, 
      collectedAmount: number,
      targetAmount: number,
      annualInterestRate: number,
      clubName: string,
      deadline: number,
      loanDuration: number,
      daysLeft: number,
      isLoading: boolean 
    }) => React.ReactNode 
  }) => {
    // Trouver la campagne correspondante dans nos données
    const campaignData = campaigns.find(c => c.id === campaignId);
    
    // Essayer de récupérer les données blockchain comme complément (sans bloquer l'affichage)
    const { data: campaignInfo, isLoading: isCampaignLoading } = useReadContract({
      address: CONTRACTS.TWELFTH_MAN as `0x${string}`,
      abi: TWELFTH_MAN_ABI,
      functionName: 'getCampaignInfo',
      args: [BigInt(campaignId)],
      query: { enabled: false } // Désactivé pour la démo
    });

    // Utiliser les données JSON comme source principale
    if (campaignData) {
      const endDate = new Date(campaignData.endDate);
      const deadline = Math.floor(endDate.getTime() / 1000);
      
      return <>{children({ 
        contributorsCount: campaignData.backers,
        collectedAmount: campaignData.currentAmount,
        targetAmount: campaignData.targetAmount,
        annualInterestRate: campaignData.interestRate,
        clubName: campaignData.clubName,
        deadline: deadline,
        loanDuration: parseInt(campaignData.duration.split(' ')[0]) || 90, // Extraire le nombre de jours
        daysLeft: campaignData.daysLeft,
        isLoading: false
      })}</>;
    }
    
    // Fallback vers les données blockchain si pas de données JSON
    if (campaignInfo) {
      const contributorsCount = Number(campaignInfo[10] || BigInt(0));
      const smartContractClubName = campaignInfo[1] || '';
      const targetAmount = Number(campaignInfo[2] || BigInt(0)) / Math.pow(10, 18);
      const collectedAmount = Number(campaignInfo[3] || BigInt(0)) / Math.pow(10, 18);
      const annualInterestRate = Number(campaignInfo[4] || BigInt(0)) / 100;
      const deadline = Number(campaignInfo[5] || BigInt(0));
      const loanDuration = Math.floor(Number(campaignInfo[6] || BigInt(0)) / (24 * 60 * 60));
      const currentTime = Math.floor(Date.now() / 1000);
      const daysLeft = deadline > currentTime ? Math.ceil((deadline - currentTime) / (24 * 60 * 60)) : 0;
      
      return <>{children({ 
        contributorsCount,
        collectedAmount,
        targetAmount,
        annualInterestRate,
        clubName: smartContractClubName,
        deadline,
        loanDuration,
        daysLeft,
        isLoading: isCampaignLoading
      })}</>;
    }
    
    // Données par défaut en cas d'échec
    return <>{children({ 
      contributorsCount: 0,
      collectedAmount: 0,
      targetAmount: 0,
      annualInterestRate: 0,
      clubName: '',
      deadline: 0,
      loanDuration: 0,
      daysLeft: 0,
      isLoading: isCampaignLoading
    })}</>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 font-sans">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <div className="rounded-2xl p-2 sm:p-4 mx-auto max-w-4xl  padding-bottom: 0px;" > 



          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 tracking-tight">
            <span className="text-white drop-shadow-2xl" style={{textShadow: '0 4px 8px rgba(0, 0, 0, 0.8)'}}>
              Fund your club,
            </span>
            <br />
            <span className="text-red-500 font-extrabold drop-shadow-2xl" style={{textShadow: '0 0 20px rgba(239, 68, 68, 0.8), 0 4px 8px rgba(0, 0, 0, 0.8)'}}>
              earn in $CHZ
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Lend to your favorite football club and receive interest in $CHZ
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="text-3xl font-bold text-white mb-1">$127K</div>
          <div className="text-sm text-gray-400">Total Funded</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-white mb-1">12%</div>
          <div className="text-sm text-gray-400">Avg. APY</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-white mb-1">1,247</div>
          <div className="text-sm text-gray-400">Investors</div>
        </div>
      </div>



      {/* Flippable Campaign Cards */}
      {loadingCampaigns ? (
        <div className="text-center text-white py-20 text-xl">Chargement des campagnes...</div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="group relative h-[600px]"
            style={{ perspective: "1000px" }}
          >
            {/* Flippable Card Container */}
            <div
              className={`relative w-full h-full preserve-3d transition-transform duration-700 ease-in-out ${
                flippedCards[campaign.id] ? 'rotate-y-180' : ''
              }`}
            >
              {/* Front Face */}
              <div className="absolute inset-0 backface-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl backdrop-blur-md border border-white/20 transition-all duration-500 group-hover:border-white/40 group-hover:from-white/15 group-hover:to-white/10" />
                
                <div className="relative p-8 rounded-3xl h-full flex flex-col justify-between">
                  <div>
                    {/* Club Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div>
                            <CampaignInfo campaignId={campaign.id}>
                              {({ clubName, isLoading }) => (
                                <h3 className="text-xl font-bold text-white">
                                  {isLoading ? '...' : (clubName || campaign.clubName)}
                                </h3>
                              )}
                            </CampaignInfo>
                            <p className="text-gray-400 text-sm">{campaign.league}</p>
                          </div>
                        </div>
                        <CampaignInfo campaignId={campaign.id}>
                          {({ annualInterestRate, clubName, contributorsCount, collectedAmount, isLoading }) => {
                            const hasSmartContractData = !isLoading && clubName;
                            const displayRate = hasSmartContractData ? annualInterestRate : campaign.interestRate;
                            
                            return (
                              <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                                <span className="text-green-400 font-bold text-sm">
                                  {isLoading ? '...' : displayRate}%
                                </span>
                              </div>
                            );
                          }}
                        </CampaignInfo>
                      </div>

                    {/* Large Club Logo - Centered */}
                    <div className="flex justify-center -mb-5">
                      <div className="w-80 h-80 rounded-3xl flex items-center justify-center  overflow-hidden">
                        {(campaignImages[campaign.id] || campaign.clubLogo) ? (
                          <Image
                            src={campaignImages[campaign.id] || campaign.clubLogo}
                            alt={`${campaign.clubName} logo`}
                            width={300}
                            height={200}
                            className="object-contain"
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div>
                    {/* Action Buttons */}
                    <div className="space-y-3">

                    {/* Amount & Stats */}
                    <CampaignInfo campaignId={campaign.id}>
                      {({ contributorsCount, collectedAmount, targetAmount, clubName, isLoading }) => {
                        // Utiliser les données du smart contract si disponibles, sinon fallback vers JSON
                        const hasSmartContractData = !isLoading && clubName;
                        const displayAmount = hasSmartContractData ? collectedAmount : campaign.currentAmount;
                        const displayTarget = hasSmartContractData ? targetAmount : campaign.targetAmount;
                        
                        return (
                          <div className="flex justify-between items-end mb-8">
                            <div>
                              <div className="text-2xl font-bold text-white mb-1">
                                {isLoading ? '...' : formatCurrency(displayAmount)}
                              </div>
                              <div className="text-gray-400 text-sm">
                                of {formatCurrency(displayTarget)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-white">
                                {isLoading ? '...' : (hasSmartContractData ? contributorsCount : campaign.backers)}
                              </div>
                              <div className="text-gray-400 text-sm">investors</div>
                            </div>
                          </div>
                        );
                      }}
                    </CampaignInfo>
                    {/* Progress Section */}
                    <CampaignInfo campaignId={campaign.id}>
                      {({ collectedAmount, targetAmount, clubName, contributorsCount, isLoading }) => {
                        // Utiliser les données du smart contract si disponibles, sinon fallback vers JSON
                        const hasSmartContractData = !isLoading && clubName;
                        const currentAmount = hasSmartContractData ? collectedAmount : campaign.currentAmount;
                        const displayTarget = hasSmartContractData ? targetAmount : campaign.targetAmount;
                        const progressPercentage = getProgressPercentage(currentAmount, displayTarget);
                        
                        return (
                          <div className="mb-6">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-gray-400 text-sm">Progress</span>
                              <span className="text-white font-semibold text-sm">
                                {isLoading ? '...' : Math.round(progressPercentage)}%
                              </span>
                            </div>
                            
                            <div className="relative">
                              <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-1000 ease-out"
                                  style={{
                                    width: `${isLoading ? 0 : progressPercentage}%`
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    </CampaignInfo>

                      <button 
                        onClick={() => toggleFlip(campaign.id)}
                        className="w-full py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
                      >
                        REVERT CARD 
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back Face */}
              <div 
                className="absolute inset-0 backface-hidden"
                style={{ transform: "rotateY(180deg)" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-white/10 rounded-3xl backdrop-blur-md border border-white/30" />
                
                {showDescription[campaign.id] ? (
                  /* Full Description View */
                  <div className="relative p-8 rounded-3xl h-full flex flex-col">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl backdrop-blur-md border border-white/20 transition-all duration-500 group-hover:border-white/40 group-hover:from-white/15 group-hover:to-white/10" />
                    <div className="relative z-10 flex items-center justify-center mb-8">
                      <h3 className="text-2xl font-bold text-white">Project Description</h3>
                      <button 
                        onClick={() => toggleDescription(campaign.id)}
                        className="absolute right-0 text-gray-300 hover:text-white transition-colors text-xl"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="relative z-10 flex-1 flex items-center justify-center">
                      <p className="text-white text-xl leading-relaxed text-center max-w-md">
                        {campaignDescriptions[campaign.id] || campaign.description || 'No description available'}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Normal Back Face Content */
                  <div className="relative p-8 rounded-3xl h-full flex flex-col justify-between">
                    <div>
                      {/* Back Header */}
                      <div className="flex items-center justify-between mb-8">
                         <div>
                           <CampaignInfo campaignId={campaign.id}>
                             {({ clubName, isLoading }) => (
                               <h3 className="text-2xl font-bold text-white mb-1">
                                 {isLoading ? '...' : (clubName || campaign.clubName)}
                               </h3>
                             )}
                           </CampaignInfo>
                         </div>
                         <div className="w-16 h-16 rounded-2xl flex items-center justify-center  overflow-hidden">
                           {(campaignImages[campaign.id] || campaign.clubLogo) ? (
                             <Image
                               src={campaignImages[campaign.id] || campaign.clubLogo}
                               alt={`${campaign.clubName} logo`}
                               width={56}
                               height={56}
                               className="object-contain"
                             />
                           ) : null}
                          </div>
                        </div>

                      {/* Detailed Stats */}
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <CampaignInfo campaignId={campaign.id}>
                            {({ annualInterestRate, clubName, contributorsCount, collectedAmount, daysLeft, isLoading }) => {
                              const hasSmartContractData = !isLoading && clubName;
                              const displayRate = hasSmartContractData ? annualInterestRate : campaign.interestRate;
                              const displayDaysLeft = hasSmartContractData ? daysLeft : campaign.daysLeft;
                              
                              return (
                                <>
                                  <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                                    <div className="text-2xl font-bold text-green-400">
                                      {isLoading ? '...' : displayRate}%
                                    </div>
                                    <div className="text-sm text-gray-300">Annual Yield</div>
                                  </div>
                                  <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                                    <div className="text-2xl font-bold text-blue-400">
                                      {isLoading ? '...' : displayDaysLeft}
                                    </div>
                                    <div className="text-sm text-gray-300">Days Left</div>
                                  </div>
                                </>
                              );
                            }}
                          </CampaignInfo>
                        </div>

                        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                          <div className="text-lg font-bold text-white mb-2">Investment Details</div>
                          <div className="space-y-2 text-sm text-gray-300">
                            <div className="flex justify-between">
                              <span>Target Amount:</span>
                              <CampaignInfo campaignId={campaign.id}>
                                {({ targetAmount, clubName, contributorsCount, collectedAmount, isLoading }) => {
                                  const hasSmartContractData = !isLoading && clubName;
                                  const displayTarget = hasSmartContractData ? targetAmount : campaign.targetAmount;
                                  
                                  return (
                                    <span className="text-white font-medium">
                                      {isLoading ? '...' : formatCurrency(displayTarget)}
                                    </span>
                                  );
                                }}
                              </CampaignInfo>
                            </div>
                            <div className="flex justify-between">
                              <span>Current Funding:</span>
                              <CampaignInfo campaignId={campaign.id}>
                                {({ collectedAmount, clubName, contributorsCount, isLoading }) => {
                                  const hasSmartContractData = !isLoading && clubName;
                                  const displayAmount = hasSmartContractData ? collectedAmount : campaign.currentAmount;
                                  
                                  return (
                                    <span className="text-white font-medium">
                                      {isLoading ? '...' : formatCurrency(displayAmount)}
                                    </span>
                                  );
                                }}
                              </CampaignInfo>
                            </div>
                            <div className="flex justify-between">
                              <span>Duration:</span>
                              <CampaignInfo campaignId={campaign.id}>
                                {({ loanDuration, clubName, isLoading }) => {
                                  const hasSmartContractData = !isLoading && clubName;
                                  const displayDuration = hasSmartContractData ? `${loanDuration} jours` : campaign.duration;
                                  
                                  return (
                                    <span className="text-white font-medium">
                                      {isLoading ? '...' : displayDuration}
                                    </span>
                                  );
                                }}
                              </CampaignInfo>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Investors:</span>
                              <CampaignInfo campaignId={campaign.id}>
                                {({ contributorsCount, clubName, collectedAmount, isLoading }) => {
                                  const hasSmartContractData = !isLoading && clubName;
                                  const displayInvestors = hasSmartContractData ? contributorsCount : campaign.backers;
                                  
                                  return (
                                    <span className="text-white font-medium">
                                      {isLoading ? '...' : displayInvestors}
                                    </span>
                                  );
                                }}
                              </CampaignInfo>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={() => toggleDescription(campaign.id)}
                          className="w-full bg-white/10 hover:bg-white/20 rounded-2xl p-3 backdrop-blur-sm transition-all cursor-pointer"
                        >
                          <div className="text-lg font-bold text-white text-center">Project Description</div>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 mt-2">
                    <Link href={`/campaign/${campaign.id}/lend`}>
                  <button className="w-full flex justify-center items-center bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all transform ">
                    Lend
                  </button>
                </Link>
                      
                      <button 
                        onClick={() => toggleFlip(campaign.id)}
                        className="w-full py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors mt-2"
                      >
                        BACK TO OVERVIEW
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Hover glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/20 to-purple-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm" />
          </div>
        ))}
      </div>
      )}
    </div>
  );
}