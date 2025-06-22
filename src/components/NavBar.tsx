"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useAtomValue } from "jotai";
import { usernameAtom } from "@/state/usernameAtom";
import Link from "next/link";

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const selectedUsername = useAtomValue(usernameAtom);
  const pathname = usePathname();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white p-4 shadow-md sticky top-0 z-50 border-b border-indigo-600">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Left Side: Logo */}
        <div className="flex items-center space-x-4">
          <Link
            href="/home"
            className="text-2xl font-bold cursor-pointer hover:text-yellow-500 transition duration-300"
          >
            MPACC Games
          </Link>
        </div>

        {/* Right Side: Menu Items + Username Display */}
        <div className="hidden md:flex items-center space-x-8">
          {/* Games Link */}
          <Link
            href="/games"
            className={`text-lg font-medium uppercase hover:text-yellow-500 transition duration-300 ${isActive("/games") ? "text-yellow-500 border-b-2 border-yellow-500" : ""
              }`}
          >
            Games
          </Link>

          {/* Leaderboard Link */}
          <Link
            href="/leaderboard"
            className={`text-lg font-medium uppercase hover:text-yellow-500 transition duration-300 ${isActive("/leaderboard") ? "text-yellow-500 border-b-2 border-yellow-500" : ""
              }`}
          >
            Leaderboard
          </Link>

          {/* Welcome Message (only show when a username is selected) */}
          {selectedUsername && (
            <div className="text-lg font-medium">
              Welcome, {selectedUsername}
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center">
          <button className="text-white text-2xl" onClick={toggleMenu}>
            {menuOpen ? "✖" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden flex flex-col items-center space-y-4 mt-4 bg-gradient-to-r from-blue-800 to-indigo-900 p-4 rounded-lg border-t border-indigo-600 shadow-md transition-all ease-in-out duration-300">
          <Link
            href="/games"
            className={`text-lg font-medium uppercase hover:text-yellow-500 transition duration-300 ${isActive("/games") ? "text-yellow-500 border-b-2 border-yellow-500" : ""
              }`}
          >
            Games
          </Link>
          <Link
            href="/leaderboard"
            className={`text-lg font-medium uppercase hover:text-yellow-500 transition duration-300 ${isActive("/leaderboard") ? "text-yellow-500 border-b-2 border-yellow-500" : ""
              }`}
          >
            Leaderboard
          </Link>

          {/* Welcome Message in Mobile Menu */}
          {selectedUsername && (
            <div className="text-white font-medium text-lg mt-4">
              Welcome, {selectedUsername}
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default NavBar;
