"use client";

import { useState, useEffect } from "react";
import GamesGrid from "@/components/GamesGrid";

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

  if (loading) {
    return <p className="text-center text-gray-500 text-lg">Loading games...</p>;
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-4xl font-semibold text-center text-gray-800 mb-8">Games List</h1>
      {games.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">No games found.</p>
      ) : (
        <GamesGrid games={games} />
      )}
    </div>
  );
};

export default GamesPage;
