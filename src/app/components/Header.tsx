'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Header() {
  return (
    <header className=" bg-transparent backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end items-center h-16">
          {/* RainbowKit Connect Button */}
          <div className="connect-button-wrapper">
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
} 