"use client";

import { useState } from "react";

const Sidemenu = () => {
  const [activeItem, setActiveItem] = useState("Home");

  const menuItems = [
    {
      name: "Home",
      path: "/",
    },
    {
      name: "Marketplace", 
      path: "/marketplace",
    },
    {
      name: "Shop",
      path: "/shop",
    },
    {
      name: "Competitions",
      path: "/competitions",
    },
    {
      name: "Tactics",
      path: "/tactics",
    },
    {
      name: "Leaderboard",
      path: "/leaderboard",
    },
    {
      name: "Activity",
      path: "/activity",
    },
  ];

    return (
    <div className="fixed left-0 top-0 h-full w-64 bg-transparent flex flex-col z-40 font-sans">
      {/* Logo/Header */}
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-bold text-white font-sans">12th Man</h1>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 mt-15">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => setActiveItem(item.name)}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 font-sans ${
                  activeItem === item.name
                    ? "bg-white/10 backdrop-blur-md text-white "
                    : "text-gray-300 hover:text-white hover:bg-white/5 hover:backdrop-blur-sm"
                }`}
              >
                <span className="font-medium">{item.name}</span>
      
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom User Info */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 font-sans">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold font-sans">$</span>
          </div>
          <div className="flex-1">
            <div className="text-white font-medium text-sm font-sans">0x3D7..6e1</div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-600 rounded-sm flex items-center justify-center">
                <span className="text-xs font-sans">◆</span>
              </div>
              <span className="text-gray-400 text-sm font-sans">0.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidemenu; 