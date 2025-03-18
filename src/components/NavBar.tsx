"use client";

import React, { useState } from 'react';
import { useRouter, usePathname } from "next/navigation";

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const navigateTo = (path: string) => {
    router.push(path);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white p-4 shadow-md sticky top-0 z-50 border-b border-indigo-600">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo/Brand */}
        <div className="flex items-center space-x-4">
          <h1
            className="text-xl font-semibold cursor-pointer hover:text-yellow-500 transition duration-300"
            onClick={() => navigateTo('/')}
          >
            MPACC Games
          </h1>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6">
          <button
            onClick={() => navigateTo('/games')}
            className={`text-sm uppercase hover:text-yellow-500 transition duration-300 ${isActive('/games') ? 'text-yellow-500' : ''}`}
          >
            Games
          </button>
          <button
            onClick={() => navigateTo('/leaderboard')}
            className={`text-sm uppercase hover:text-yellow-500 transition duration-300 ${isActive('/leaderboard') ? 'text-yellow-500' : ''}`}
          >
            Leaderboard
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center">
          <button className="text-white text-2xl" onClick={toggleMenu}>
            {menuOpen ? '✖' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden flex flex-col space-y-4 mt-4 bg-gradient-to-r from-blue-800 to-indigo-900 p-4 rounded-lg border-t border-indigo-600 shadow-md transition-all ease-in-out duration-300">
          <button
            onClick={() => navigateTo('/games')}
            className={`text-white text-lg uppercase hover:text-yellow-500 transition duration-300 ${isActive('/games') ? 'text-yellow-500' : ''}`}
          >
            Games
          </button>
          <button
            onClick={() => navigateTo('/leaderboard')}
            className={`text-white text-lg uppercase hover:text-yellow-500 transition duration-300 ${isActive('/leaderboard') ? 'text-yellow-500' : ''}`}
          >
            Leaderboard
          </button>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
