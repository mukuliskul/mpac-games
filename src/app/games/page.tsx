"use client";

import { useState, useEffect } from "react";
import GamesGrid from "@/components/GamesGrid"; // Assuming you're importing the GamesGrid component

const GamesPage = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetching games
  useEffect(() => {
    async function fetchGames() {
      const response = await fetch("/api/games");
      const data = await response.json();
      setGames(data);
      setLoading(false);
    }

    fetchGames();
  }, []);

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-4xl font-semibold text-center text-gray-800 mb-8">Games List</h1>

      {loading ? (
        <p className="text-center text-gray-500 text-lg">Loading games...</p>
      ) : games.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">No games found.</p>
      ) : (
        <GamesGrid games={games} />
      )}
    </div>
  );
};

export default GamesPage;
