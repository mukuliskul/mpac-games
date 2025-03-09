"use client";

import { useState, useEffect } from "react";
import GamesGrid from "@/components/GamesGrid";
import { Game } from "@/lib/types/interfaces"

const GamesPage = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetching games
  useEffect(() => {
    async function fetchGames() {
      try {
        const response = await fetch("/api/games");

        if (!response.ok) {
          throw new Error('Failed to fetch games');
        }

        const data = await response.json();
        setGames(data);
        setLoading(false);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError('Failed to fetch games.');
        } else {
          setError('An unexpected error occurred.');
        }
        setLoading(false);
      }
    }

    fetchGames();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500 text-lg">Loading games...</p>;
  }

  if (error) {
    return <div>{error}</div>;
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
