"use client";

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from '@/components/ui/navigation-menu';

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="bg-gray-900 text-white p-4 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo/Brand */}
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold cursor-pointer hover:text-yellow-400 transition duration-300 ease-in-out" onClick={() => navigateTo('/')}>
            Home
          </h1>
        </div>

        {/* Desktop Menu */}
        <NavigationMenu>
          <NavigationMenuList className="hidden md:flex space-x-6">
            <NavigationMenuItem>
              <NavigationMenuLink
                onClick={() => navigateTo('/games')}
                className="cursor-pointer hover:text-yellow-400 transition duration-300 ease-in-out"
              >
                Games
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                onClick={() => navigateTo('/leaderboard')}
                className="cursor-pointer hover:text-yellow-400 transition duration-300 ease-in-out"
              >
                Leaderboard
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center">
          <button className="text-white text-2xl" onClick={toggleMenu}>
            {menuOpen ? '✖' : '☰'} {/* Toggle between Hamburger and Close Icons */}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden flex flex-col space-y-4 mt-4 bg-gray-800 p-4 rounded-lg transition-all ease-in-out duration-300">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  onClick={() => navigateTo('/games')}
                  className="text-white hover:text-yellow-400 transition duration-300 ease-in-out"
                >
                  Games
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  onClick={() => navigateTo('/leaderboard')}
                  className="text-white hover:text-yellow-400 transition duration-300 ease-in-out"
                >
                  Leaderboard
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
