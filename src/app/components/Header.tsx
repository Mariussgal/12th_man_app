'use client';

export default function Header() {
  return (
    <header className="bg-transparent backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end items-center h-16">
          {/* Mobile spacing to account for hamburger menu */}
          <div className="md:hidden w-16" />
          
          {/* RainbowKit Connect Button */}
          <div className="flex-shrink-0">
            {/* Connect button space - managed by other components */}
          </div>
        </div>
      </div>
    </header>
  );
} 