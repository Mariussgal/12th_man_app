import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Aurora from "./components/Aurora";
import Sidemenu from "./components/Sidemenu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "12th Man - Web3 Crowdfunding for Football Clubs",
  description: "Fund your favorite club and earn interest in $CHZ",
  keywords: "football, crowdfunding, web3, chiliz, NFT, clubs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950 text-white`}
      >
        {/* Aurora Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <Aurora
            colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
            blend={0.5}
            amplitude={1.0}
            speed={0.5}
          />
        </div>

        {/* Sidemenu */}
        <Sidemenu />
        
        {/* Main Layout with offset for sidebar */}
        <div className="ml-64 min-h-screen flex flex-col relative z-10">
          {/* Top Header */}
          <header className=" bg-transparent backdrop-blur-sm sticky top-0 z-50">
            <div className="px-6 py-4">
              <div className="flex justify-end items-center">
                {/* Wallet Connect Button */}
                <button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 font-sans">
                  Connect Wallet
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className=" backdrop-blur-sm mt-20">
            <div className="px-6 py-8">
              <div className="text-center">
                <p className="text-gray-400">
                  © 2025 12th Man - Be the 12th man on the field
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Built on Chiliz 
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}