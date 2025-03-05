"use client";

import { useEffect, useState } from "react";
import GamesGrid from "@/components/GamesGrid";

export default function GamesPage() {
  const [games, setGames] = useState<{ id: number; name: string; desc: string; image_url: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGames() {
      try {
        const response = await fetch("/api/games");
        const data = await response.json();
        setGames(data);
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchGames();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold text-center mb-6">Games List</h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading games...</p>
      ) : games.length === 0 ? (
        <p className="text-center text-gray-500">No games found.</p>
      ) : (
        <GamesGrid games={games} />
      )}
    </div>
  );
}
