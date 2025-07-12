import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import '@rainbow-me/rainbowkit/styles.css';
import Aurora from "./components/Aurora";
import Header from "./components/Header";
import { Providers } from './providers';
import AccountGate from "./components/AccountGate";
import ResponsiveLayout from "./components/ResponsiveLayout";


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
  openGraph: {
    title: "12th Man - Web3 Crowdfunding for Football Clubs",
    description: "Fund your favorite club and earn interest in $CHZ",
    url: "https://12th-man-app.vercel.app/", 
    siteName: "12th Man",
    images: [
      {
        url: "/banner.png", 
        width: 1200,
        height: 630,
        alt: "12th Man - Web3 Crowdfunding Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "12th Man - Web3 Crowdfunding for Football Clubs",
    description: "Fund your favorite club and earn interest in $CHZ",
    images: ["/banner.png"],
  },
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
        <Providers>
          {/* Aurora Background */}
          <div className="fixed inset-0 z-0 pointer-events-none">
            <Aurora
              colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
              blend={0.5}
              amplitude={1.0}
              speed={0.5}
            />
          </div>

          {/* Responsive Layout Wrapper */}
          <ResponsiveLayout>
            {/* Top Header */}
            <Header/>
            <AccountGate />

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
          </ResponsiveLayout>
        </Providers>
      </body>
    </html>
  );
}