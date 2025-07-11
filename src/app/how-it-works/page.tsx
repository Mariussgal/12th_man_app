"use client";

import { useState } from "react";

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 1,
      title: "Connect your Wallet",
      description: "Connect your Web3 wallet compatible with the Chiliz network to get started.",
      icon: "🔐",
      details: [
        "Use MetaMask or any other compatible wallet",
        "Connect to the Chiliz Chain network",
        "Secured by blockchain technology"
      ]
    },
    {
      id: 2,
      title: "Choose your Club",
      description: "Browse funding campaigns from European football clubs.",
      icon: "⚽",
      details: [
        "Verified and certified clubs",
        "Transparent projects with clear objectives",
        "Different amounts and durations available"
      ]
    },
    {
      id: 3,
      title: "Invest in $USDC",
      description: "Lend your $USDC tokens to the club of your choice.",
      icon: "💰",
      details: [
        "No minimum amount required",
        "Secure smart contracts"
      ]
    },
    {
      id: 4,
      title: "Earn Interest",
      description: "At maturity, receive your capital back plus interest payments in $CHZ.",
      icon: "📈",
      details: [
        "Automatic payments via smart contracts",
        "Capital repayment + interest in $CHZ",
        "Full transparency on the blockchain"
      ]
    }
  ];

  const features = [
    {
      title: "Blockchain Security",
      description: "All loans are secured by audited smart contracts on the Chiliz blockchain.",
      icon: "🛡️"
    },
    {
      title: "Attractive Rates",
      description: "Enjoy competitive interest rates up to 50% APY depending on campaigns.",
      icon: "📊"
    },
    {
      title: "Full Transparency",
      description: "Track real-time fund usage and your investment performance.",
      icon: "✅"
    },
    {
      title: "Active Community",
      description: "Join a community of football and cryptocurrency enthusiasts.",
      icon: "👥"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 font-sans">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="rounded-2xl p-8 mx-auto max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            <span className="text-white drop-shadow-2xl" style={{textShadow: '0 4px 8px rgba(0, 0, 0, 0.8)'}}>
              How it works?
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Discover how to fund your favorite club and earn interest in $CHZ in just 4 simple steps.
          </p>
        </div>
      </div>

      {/* Steps Section */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Get started in 4 steps
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Steps Navigation */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`group relative cursor-pointer transition-all duration-300 ${
                  activeStep === index ? 'scale-105' : 'hover:scale-102'
                }`}
                onClick={() => setActiveStep(index)}
              >
                {/* Card Background */}
                <div className={`absolute inset-0 bg-gradient-to-br rounded-2xl backdrop-blur-md border transition-all duration-300 ${
                  activeStep === index 
                    ? 'from-red-500/20 to-red-600/10 border-red-500/40' 
                    : 'from-white/8 to-white/3 border-white/15 hover:border-white/25'
                }`} />
                
                <div className="relative p-6 rounded-2xl">
                  <div className="flex items-center space-x-4">
                    {/* Step Number */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold transition-all duration-300 ${
                      activeStep === index
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-800/40 text-gray-400'
                    }`}>
                      {step.id}
                    </div>
                    
                    {/* Step Content */}
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold transition-colors duration-300 ${
                        activeStep === index ? 'text-white' : 'text-gray-300'
                      }`}>
                        {step.title}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">
                        {step.description}
                      </p>
                    </div>

                    {/* Icon */}
                    <div className={`text-xl transition-colors duration-300 ${
                      activeStep === index ? 'opacity-100' : 'opacity-60'
                    }`}>
                      {step.icon}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Active Step Details */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl backdrop-blur-md border border-white/20" />
            
            <div className="relative p-8 rounded-3xl">
                             <div className="flex items-center space-x-4 mb-6">
                 <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center">
                   {steps[activeStep] && (
                     <div className="text-3xl">
                       {steps[activeStep].icon}
                     </div>
                   )}
                 </div>
                                 <div>
                   <h3 className="text-2xl font-bold text-white">
                     {steps[activeStep]?.title}
                   </h3>
                   <p className="text-gray-400">
                     Step {activeStep + 1} of {steps.length}
                   </p>
                 </div>
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">
                {steps[activeStep]?.description}
              </p>

                             <div className="space-y-3">
                 {steps[activeStep]?.details.map((detail, index) => (
                   <div key={index} className="flex items-center space-x-3">
                     <div className="text-green-400 flex-shrink-0">✅</div>
                     <span className="text-gray-300 text-sm">{detail}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Why choose 12th Man?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group relative">
              {/* Card Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/8 to-white/3 rounded-2xl backdrop-blur-md border border-white/15 transition-all duration-500 group-hover:border-white/25 group-hover:from-white/12 group-hover:to-white/6" />
              
              <div className="relative p-6 rounded-2xl transition-transform duration-300 group-hover:-translate-y-1">
                                 <div className="flex items-start space-x-4">
                   <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-xl flex items-center justify-center border border-red-500/20">
                     <div className="text-xl">{feature.icon}</div>
                   </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="mb-20">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl backdrop-blur-md border border-white/20" />
          
          <div className="relative p-8 rounded-3xl text-center">
            <h2 className="text-3xl font-bold text-white mb-8">
              12th Man in numbers
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl font-bold text-red-400 mb-2">-</div>
                <div className="text-gray-400 text-sm">Total funded</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-400 mb-2">-</div>
                <div className="text-gray-400 text-sm">Average APY</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-400 mb-2">-</div>
                <div className="text-gray-400 text-sm">Partner clubs</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-400 mb-2">-</div>
                <div className="text-gray-400 text-sm">Active investors</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-3xl backdrop-blur-md border border-red-500/30" />
          
          <div className="relative p-8 rounded-3xl">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to start?
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of investors who fund their favorite club 
              and earn attractive interest in $CHZ.
            </p>
            
            <div className="flex justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/20">
                View campaigns
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 