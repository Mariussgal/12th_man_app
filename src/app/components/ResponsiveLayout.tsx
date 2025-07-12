"use client";

import { useState } from "react";
import Sidemenu from "./Sidemenu";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

const ResponsiveLayout = ({ children }: ResponsiveLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Hamburger Menu Button - Only visible on mobile */}
      <button
        onClick={toggleMobileMenu}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-black/20 backdrop-blur-md border border-white/10 text-white md:hidden"
        aria-label="Open menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidemenu */}
      <Sidemenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
      
      {/* Main Layout with responsive offset for sidebar */}
      <div className="md:ml-64 min-h-screen flex flex-col relative z-10">
        {children}
      </div>
    </>
  );
};

export default ResponsiveLayout; 