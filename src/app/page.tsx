"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import campaignsData from "../data/campaigns.json";
import Link from "next/link";
import { useReadContract, usePublicClient } from 'wagmi';
import { getEventSelector } from 'viem';
import { CONTRACTS, TWELFTH_MAN_ABI, PSG_TOKEN_ABI } from "../config/contracts";

export default function Home() {
  const publicClient = usePublicClient();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [flippedCards, setFlippedCards] = useState<{[key: number]: boolean}>({});
  const [showDescription, setShowDescription] = useState<{[key: number]: boolean}>({});
  const [campaignImages, setCampaignImages] = useState<{[key: number]: string}>({});

  // Fetch all campaign IDs from CampaignCreated events, then fetch their info
  useEffect(() => {
    async function fetchCampaigns() {
      setLoadingCampaigns(true);
      try {
        if (!publicClient) return;
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
        // Extract unique campaignIds
        const campaignIds = Array.from(new Set(logs.map(log => Number(log.args.campaignId))));
        // Fetch info for each campaign
        const campaignInfos = await Promise.all(
          campaignIds.map(async (id) => {
            try {
              // getCampaignInfo returns [clubOwner, clubName, targetAmount, collectedAmount, annualInterestRate, deadline, isActive, isCompleted, contributorsCount]
              const info = await publicClient.readContract({
                address: CONTRACTS.TWELFTH_MAN as `0x${string}`,
                abi: TWELFTH_MAN_ABI,
                functionName: 'getCampaignInfo',
                args: [BigInt(id)],
              });
              return {
                id,
                clubName: info[1],
                targetAmount: info[2],
                currentAmount: info[3],
                interestRate: Number(info[4]) / 100,
                duration: '', // Not in getCampaignInfo, can be added if needed
                endDate: '', // Not in getCampaignInfo, can be added if needed
                description: '', // Not in getCampaignInfo, can be added if needed
                clubLogo: '', // Will be filled by image fetch
                backers: Number(info[8]),
                daysLeft: 0, // Can be calculated if needed
                league: '', // Not in getCampaignInfo, can be added if needed
              };
            } catch (e) {
              return null;
            }
          })
        );
        setCampaigns(campaignInfos.filter(Boolean));
      } catch (e) {
        setCampaigns([]);
      } finally {
        setLoadingCampaigns(false);
      }
    }
    fetchCampaigns();
  }, [publicClient]);

  useEffect(() => {
    async function fetchImages() {
      console.log('fetchImages called with campaigns:', campaigns);
      
      const images: {[key: number]: string} = {};
      await Promise.all(
        campaigns.map(async (campaign) => {
          try {
            console.log(`Fetching image for campaign ${campaign.id}`);
            const res = await fetch(`/api/campaign-image?campaignId=${campaign.id}`);
            console.log(`Response for campaign ${campaign.id}:`, res.status);
            
            if (res.ok) {
              const data = await res.json();
              console.log(`Image data for campaign ${campaign.id}:`, data);
              if (data.imageUrl) {
                images[campaign.id] = data.imageUrl;
              }
            } else {
              console.log(`No image found for campaign ${campaign.id}`);
            }
          } catch (e) {
            console.error(`Error fetching image for campaign ${campaign.id}:`, e);
          }
        })
      );
      
      console.log('Final images mapping:', images);
      setCampaignImages(images);
    }
    if (campaigns.length > 0) fetchImages();
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

  // Hook pour récupérer les informations des campagnes depuis le smart contract
  const CampaignInfo = ({ campaignId, children }: { 
    campaignId: number, 
    children: (data: { 
      contributorsCount: number, 
      collectedAmount: number,
      targetAmount: number,
      annualInterestRate: number,
      clubName: string,
      isLoading: boolean 
    }) => React.ReactNode 
  }) => {
    const { data: campaignInfo, isLoading: isCampaignLoading } = useReadContract({
      address: CONTRACTS.TWELFTH_MAN as `0x${string}`,
      abi: TWELFTH_MAN_ABI,
      functionName: 'getCampaignInfo',
      args: [BigInt(campaignId)],
    });

    // Lecture des décimales du token PSG pour la conversion correcte
    const { data: tokenDecimals } = useReadContract({
      address: CONTRACTS.PSG_TOKEN as `0x${string}`,
      abi: PSG_TOKEN_ABI,
      functionName: 'decimals',
    });

    // Debug logs
    console.log(`Campaign ${campaignId} - Raw data:`, campaignInfo);
    console.log(`Token decimals:`, tokenDecimals);

    const contributorsCount = campaignInfo ? Number(campaignInfo[8] || BigInt(0)) : 0;
    
    // Récupérer le nom du club (index 1)
    const smartContractClubName = campaignInfo ? campaignInfo[1] || '' : '';
    
    // Fonction pour formater les montants PSG avec les bonnes décimales
    const formatPSGAmount = (amount: bigint) => {
      if (!amount) return 0;
      
      // Utiliser les décimales du token PSG (généralement 0 pour Chiliz)
      const actualDecimals = tokenDecimals ?? 0;
      
      // Si c'est un très gros nombre, c'est probablement stocké en wei (18 décimales)
      // sinon utiliser les décimales réelles du token
      const decimalsToUse = amount > BigInt("1000000000000000000") ? 18 : actualDecimals;
      const divisor = BigInt(10 ** decimalsToUse);
      
      const formatted = Number(amount) / Number(divisor);
      console.log(`Formatage montant:`, { 
        amount: amount.toString(), 
        decimalsToUse, 
        actualDecimals,
        formatted 
      });
      
      return formatted;
    };
    
    // Récupérer le montant objectif (index 2) - convertir avec les bonnes décimales
    const rawTargetAmount = campaignInfo ? campaignInfo[2] || BigInt(0) : BigInt(0);
    const targetAmount = formatPSGAmount(rawTargetAmount);
    
    // Récupérer le montant collecté (index 3) - convertir avec les bonnes décimales
    const rawCollectedAmount = campaignInfo ? campaignInfo[3] || BigInt(0) : BigInt(0);
    const collectedAmount = formatPSGAmount(rawCollectedAmount);
    
    // Récupérer le taux d'intérêt annuel (index 4) - convertir depuis basis points 
    const rawAnnualInterestRate = campaignInfo ? campaignInfo[4] || BigInt(0) : BigInt(0);
    const annualInterestRate = Number(rawAnnualInterestRate) / 100;
    
    console.log(`Campaign ${campaignId} - Processed:`, {
      contributorsCount,
      clubName: smartContractClubName,
      rawTargetAmount: rawTargetAmount.toString(),
      targetAmount: targetAmount + ' USDC',
      rawCollectedAmount: rawCollectedAmount.toString(),
      collectedAmount: collectedAmount + ' USDC',
      rawAnnualInterestRate: rawAnnualInterestRate.toString() + ' basis points',
      annualInterestRate: annualInterestRate + '%',
      isLoading: isCampaignLoading
    });
    
    return <>{children({ 
      contributorsCount, 
      collectedAmount, 
      targetAmount,
      annualInterestRate,
      clubName: smartContractClubName,
      isLoading: isCampaignLoading 
    })}</>;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 font-sans">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="rounded-2xl p-8 mx-auto max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className="text-white drop-shadow-2xl" style={{textShadow: '0 4px 8px rgba(0, 0, 0, 0.8)'}}>
              Fund your club,
            </span>
            <br />
            <span className="text-red-500 font-extrabold drop-shadow-2xl" style={{textShadow: '0 0 20px rgba(239, 68, 68, 0.8), 0 4px 8px rgba(0, 0, 0, 0.8)'}}>
              earn in $CHZ
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Lend to your favorite football club and receive guaranteed interest in $CHZ
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-6 mb-12 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="text-3xl font-bold text-white mb-1">€287K</div>
          <div className="text-sm text-gray-400">Total Funded</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-400 mb-1">42%</div>
          <div className="text-sm text-gray-400">Avg. APY</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-400 mb-1">1,247</div>
          <div className="text-sm text-gray-400">Investors</div>
        </div>
      </div>



      {/* Flippable Campaign Cards */}
      {loadingCampaigns ? (
        <div className="text-center text-white py-20 text-xl">Chargement des campagnes...</div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-30">
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
                            const hasSmartContractData = !isLoading && (clubName || contributorsCount > 0 || collectedAmount > 0);
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
                        const hasSmartContractData = !isLoading && (clubName || contributorsCount > 0 || collectedAmount > 0);
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
                        const hasSmartContractData = !isLoading && (clubName || contributorsCount > 0 || collectedAmount > 0);
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
                        {campaign.description}
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
                            {({ annualInterestRate, clubName, contributorsCount, collectedAmount, isLoading }) => {
                              const hasSmartContractData = !isLoading && (clubName || contributorsCount > 0 || collectedAmount > 0);
                              const displayRate = hasSmartContractData ? annualInterestRate : campaign.interestRate;
                              
                              return (
                                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                                  <div className="text-2xl font-bold text-green-400">
                                    {isLoading ? '...' : displayRate}%
                                  </div>
                                  <div className="text-sm text-gray-300">Annual Yield</div>
                                </div>
                              );
                            }}
                          </CampaignInfo>
                          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                            <div className="text-2xl font-bold text-blue-400">{campaign.daysLeft}</div>
                            <div className="text-sm text-gray-300">Days Left</div>
                          </div>
                        </div>

                        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                          <div className="text-lg font-bold text-white mb-2">Investment Details</div>
                          <div className="space-y-2 text-sm text-gray-300">
                            <div className="flex justify-between">
                              <span>Target Amount:</span>
                              <CampaignInfo campaignId={campaign.id}>
                                {({ targetAmount, clubName, contributorsCount, collectedAmount, isLoading }) => {
                                  const hasSmartContractData = !isLoading && (clubName || contributorsCount > 0 || collectedAmount > 0);
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
                                  const hasSmartContractData = !isLoading && (clubName || contributorsCount > 0 || collectedAmount > 0);
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
                              <span className="text-white font-medium">{campaign.duration}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Investors:</span>
                              <CampaignInfo campaignId={campaign.id}>
                                {({ contributorsCount, clubName, collectedAmount, isLoading }) => {
                                  const hasSmartContractData = !isLoading && (clubName || contributorsCount > 0 || collectedAmount > 0);
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