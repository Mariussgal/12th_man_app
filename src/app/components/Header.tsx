'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Header() {
  return (
    <header className=" bg-transparent backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="/" className="text-gray-300 hover:text-white transition-colors">
              Campaigns
            </a>
            <a href="/profile" className="text-gray-300 hover:text-white transition-colors">
              My Profile
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              How it works
            </a>
          </nav>

          {/* RainbowKit Connect Button */}
          <div className="connect-button-wrapper">
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
} 