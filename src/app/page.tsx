"use client";

import { useState } from "react";
import Image from "next/image";
import campaignsData from "../data/campaigns.json";
import Link from "next/link";

export default function Home() {
  const campaigns = campaignsData;
  const [flippedCards, setFlippedCards] = useState<{[key: number]: boolean}>({});

  const toggleFlip = (campaignId: number) => {
    setFlippedCards(prev => ({
      ...prev,
      [campaignId]: !prev[campaignId]
    }));
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
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

      {/* Minimal Filters */}
      <div className="flex justify-center gap-2 mb-12">
        <button className="px-6 py-2 bg-white/20 text-white rounded-full text-sm font-medium backdrop-blur-sm border border-white/30">
          All
        </button>
      </div>

      {/* Flippable Campaign Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                            <h3 className="text-xl font-bold text-white">{campaign.clubName}</h3>
                            <p className="text-gray-400 text-sm">{campaign.league}</p>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                          <span className="text-green-400 font-bold text-sm">{campaign.interestRate}%</span>
                        </div>
                      </div>

                    {/* Large Club Logo - Centered */}
                    <div className="flex justify-center -mb-5">
                      <div className="w-80 h-80 rounded-3xl flex items-center justify-center  overflow-hidden">
                        <Image
                          src={campaign.clubLogo}
                          alt={`${campaign.clubName} logo`}
                          width={300}
                          height={200}
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    {/* Action Buttons */}
                    <div className="space-y-3">

                    {/* Amount & Stats */}
                    <div className="flex justify-between items-end mb-8">
                      <div>
                        <div className="text-2xl font-bold text-white mb-1">
                          {formatCurrency(campaign.currentAmount)}
                        </div>
                        <div className="text-gray-400 text-sm">
                          of {formatCurrency(campaign.targetAmount)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-white">{campaign.backers}</div>
                        <div className="text-gray-400 text-sm">investors</div>
                      </div>
                    </div>
                    {/* Progress Section */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-400 text-sm">Progress</span>
                        <span className="text-white font-semibold text-sm">
                          {Math.round(getProgressPercentage(campaign.currentAmount, campaign.targetAmount))}%
                        </span>
                      </div>
                      
                      <div className="relative">
                        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-1000 ease-out"
                            style={{
                              width: `${getProgressPercentage(campaign.currentAmount, campaign.targetAmount)}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>

                      <button 
                        onClick={() => toggleFlip(campaign.id)}
                        className="w-full py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
                      >
                        REVERT CARD →
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
                
                <div className="relative p-8 rounded-3xl h-full flex flex-col justify-between">
                  <div>
                    {/* Back Header */}
                    <div className="flex items-center justify-between mb-8">
                       <div>
                         <h3 className="text-2xl font-bold text-white mb-1">{campaign.clubName}</h3>
                         <p className="text-gray-300">Detailed Information</p>
                       </div>
                       <div className="w-16 h-16 rounded-2xl flex items-center justify-center  overflow-hidden">
                         <Image
                           src={campaign.clubLogo}
                           alt={`${campaign.clubName} logo`}
                           width={56}
                           height={56}
                           className="object-contain"
                         />
                       </div>
                     </div>

                    {/* Detailed Stats */}
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                          <div className="text-2xl font-bold text-green-400">{campaign.interestRate}%</div>
                          <div className="text-sm text-gray-300">Annual Yield</div>
                        </div>
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
                            <span className="text-white font-medium">{formatCurrency(campaign.targetAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Current Funding:</span>
                            <span className="text-white font-medium">{formatCurrency(campaign.currentAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Duration:</span>
                            <span className="text-white font-medium">{campaign.duration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Investors:</span>
                            <span className="text-white font-medium">{campaign.backers}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
                        <div className="text-lg font-bold text-white ">Project Description</div>
            
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mt-2">
                  <Link href={`/campaign/${campaign.id}/lend`}>
                <button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all transform group-hover:scale-105">
                  Lend
                </button>
              </Link>
                    
                    <button 
                      onClick={() => toggleFlip(campaign.id)}
                      className="w-full py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
                    >
                      ← Back to Overview
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Hover glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/20 to-purple-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm" />
          </div>
        ))}
      </div>
    </div>
  );
}