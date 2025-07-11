"use client";

import { useState } from "react";

export default function FAQ() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  const faqData = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "What is 12th Man?",
          answer: "12th Man is a decentralized platform that allows football fans to fund their favorite clubs by lending cryptocurrency and earning interest in return. All transactions are secured by smart contracts on the Chiliz blockchain."
        },
        {
          question: "How do I get started?",
          answer: "To get started, you need to connect a Web3 wallet compatible with the Chiliz network, such as MetaMask. Once connected, you can browse available campaigns and start investing."
        },
        {
          question: "What currencies can I use?",
          answer: "You can lend using USDC and receive interest payments in CHZ tokens. This provides stability for your investment while earning rewards in the native token of football fan engagement."
        }
      ]
    },
    {
      category: "Investments",
      questions: [
        {
          question: "What is the minimum investment amount?",
          answer: "There is no minimum investment amount required. You can start with any amount you're comfortable with, making the platform accessible to all types of investors."
        },
        {
          question: "How are interest rates determined?",
          answer: "Interest rates vary by campaign and are determined by the club's funding needs, campaign duration, and market conditions. Rates typically range from 30% to 50% APY."
        },
        {
          question: "When do I receive my returns?",
          answer: "Returns are paid automatically at the end of the campaign period through smart contracts. You receive your initial capital plus accrued interest in CHZ tokens."
        },
        {
          question: "Can I withdraw my investment early?",
          answer: "Investments are locked for the duration of the campaign period. Early withdrawal is not currently available, so please ensure you can commit to the full campaign length."
        }
      ]
    },
    {
      category: "Security & Trust",
      questions: [
        {
          question: "How secure are my funds?",
          answer: "All funds are secured by audited smart contracts on the Chiliz blockchain. The decentralized nature of the platform eliminates single points of failure and ensures transparency."
        },
        {
          question: "Are the football clubs verified?",
          answer: "Yes, all partner clubs undergo a verification process to ensure legitimacy. We work only with established football clubs that meet our partnership criteria."
        },
        {
          question: "What happens if a club defaults?",
          answer: "While we work with reputable clubs to minimize risk, all investments carry inherent risk. Each campaign includes detailed information about the club and project to help you make informed decisions."
        }
      ]
    },
    {
      category: "Technical",
      questions: [
        {
          question: "Which wallets are supported?",
          answer: "We support all wallets compatible with the Chiliz network, including MetaMask, WalletConnect-compatible wallets, and other Web3 wallets that can connect to Chiliz Chain."
        },
        {
          question: "What blockchain does 12th Man use?",
          answer: "12th Man operates on the Chiliz blockchain, which is specifically designed for sports and entertainment applications, providing fast and low-cost transactions."
        },
        {
          question: "How can I track my investments?",
          answer: "All investment activities are recorded on the blockchain and can be tracked in real-time. Your dashboard provides detailed information about your active investments and returns."
        }
      ]
    }
  ];

  const toggleQuestion = (categoryIndex: number, questionIndex: number) => {
    const questionId = categoryIndex * 100 + questionIndex;
    setOpenQuestion(openQuestion === questionId ? null : questionId);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 font-sans">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
          <span className="text-white drop-shadow-2xl" style={{textShadow: '0 4px 8px rgba(0, 0, 0, 0.8)'}}>
            FAQ
          </span>
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Find answers to frequently asked questions about 12th Man platform.
        </p>
      </div>

      {/* FAQ Sections */}
      <div className="space-y-12">
        {faqData.map((category, categoryIndex) => (
          <div key={categoryIndex} className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/2 rounded-2xl backdrop-blur-md border border-white/10" />
            
            <div className="relative p-8 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">
                {category.category}
              </h2>
              
              <div className="space-y-4">
                {category.questions.map((faq, questionIndex) => {
                  const questionId = categoryIndex * 100 + questionIndex;
                  const isOpen = openQuestion === questionId;
                  
                  return (
                    <div key={questionIndex} className="border-b border-white/10 last:border-b-0">
                      <button
                        onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                        className="w-full text-left py-4 flex items-center justify-between group transition-colors hover:text-gray-200"
                      >
                        <span className="text-white font-medium pr-4">
                          {faq.question}
                        </span>
                        <div className={`flex-shrink-0 w-5 h-5 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}>
                          <svg
                            className="w-5 h-5 text-gray-400 group-hover:text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </button>
                      
                      {isOpen && (
                        <div className="pb-4 transition-all duration-200">
                          <p className="text-gray-300 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contact Section */}
      <div className="mt-16 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/2 rounded-2xl backdrop-blur-md border border-white/10" />
          
          <div className="relative p-8 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-300 mb-6">
              If you couldn't find what you were looking for, feel free to reach out to our support team.
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 