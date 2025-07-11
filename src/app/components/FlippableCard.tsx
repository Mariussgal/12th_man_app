"use client";

import React, { useState } from 'react';
import Image from 'next/image';

const FlippableNFTCard = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full my-6">
      <div
        className="relative w-[170px] sm:w-[320px] h-[100px] sm:h-[180px] mb-4"
        style={{ perspective: "1000px" }}
      >
        <div
          className={`relative w-full h-full shadow-xl rounded-lg transition-transform duration-700 ease-in-out preserve-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front Face */}
          <div
            className="absolute w-full h-full rounded-lg backface-hidden"
          >
            <a 
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-full flex items-center justify-center"
            >
              <Image
                src="/businessCard.jpg"
                alt="NFT Business Card"
                fill
                className="object-cover rounded-lg"
              />
            </a>
          </div>

          {/* Back Face */}
          <div
            className="absolute w-full h-full rounded-lg overflow-hidden flex backface-hidden"
            style={{ 
              transform: "rotateY(180deg)",
            }}
          >
            {/* Left Side - Info */}
            <div className="bg-black w-1/2 p-3 sm:p-4 text-purple-400 flex flex-col justify-between rounded-l-lg">
              <div>
                <h3 className="text-[10px] sm:text-sm font-bold mb-1">
                  NFT Business Card
                </h3>
                <p className="text-[8px] sm:text-xs text-gray-300">
                  This NFT serves as my digital business card on the Sepolia testnet.
                </p>
              </div>
              
              <div className="hidden sm:block">
                <p className="text-[10px] sm:text-sm text-gray-300 mb-1">
                  Contract Address:
                </p>
                <p className="text-[8px] text-gray-300 break-all">
                  0x76526BC283456aa2445634f22D30020290031d5D
                </p>
              </div>
            </div>
            
            {/* Right Side - QR Code */}
            <div className="bg-gradient-to-b from-purple-600 to-pink-500 w-1/2 flex items-center justify-center p-2 rounded-r-lg">
              <a 
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-full flex items-center justify-center"
              >
                <div className="relative max-h-[90%] max-w-[90%] aspect-square">
                  <Image
                    src="/businessCard.jpg"
                    alt="QR Code"
                    fill
                    className="object-contain"
                  />
                </div>
              </a>
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleFlip} 
          className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs sm:text-sm transition-colors duration-200"
        >
          {isFlipped ? "View Front" : "View Details"}
        </button>
      </div>
    </div>
  );
};

export default FlippableNFTCard;