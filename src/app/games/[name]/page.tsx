"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Game } from "@/lib/types/game"


export default function GamePage({
  params,
}: Readonly<{
  params: Promise<{ name: string }>;
}>) {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); // Error state
  const { name } = use(params);
  const router = useRouter();

  useEffect(() => {
    async function fetchGame() {
      try {
        const response = await fetch(`/api/games/${name}`);

        if (!response.ok) {
          throw new Error('Game not found');
        }

        const data = await response.json();
        setGame(data);
        setLoading(false);
      } catch (err: unknown) {
        if (err instanceof Error) {
          // Now TypeScript knows that `err` is an instance of `Error`
          console.error(err.message);
          setError('Failed to fetch game details.');
        } else {
          console.error('An unexpected error occurred');
          setError('An unexpected error occurred.');
        }
        setLoading(false);
      }
    }

    fetchGame();
  }, [name]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>; // Display error message
  }

  if (!game) {
    return <div>Game not found!</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Game Title */}
      <h1 className="text-4xl font-bold text-center mb-6">{game.name}</h1>

      {/* Game Description */}
      <Card className="mb-6 p-4">
        <h2 className="text-2xl font-semibold">Description</h2>
        <p className="text-lg">{game.description}</p>
      </Card>

      {/* Game Rules */}
      {game.rules && (
        <Card className="mb-6 p-4">
          <h2 className="text-2xl font-semibold">Rules</h2>
          <p className="text-lg">{game.rules}</p>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between mb-6">
        <Button
          onClick={() => router.push(`/leaderboard/${game.name.toLowerCase().replace(/\s+/g, '-')}`)}
          className="w-1/2 mr-2"
        >
          View Leaderboard
        </Button>

        <Button
          onClick={() => router.push(`/enroll/${game.name.toLowerCase().replace(/\s+/g, '-')}`)}
          className="w-1/2"
        >
          Enroll
        </Button>
      </div>

      {game.type && (
        <Card className="mb-6 p-4">
          <h2 className="text-2xl font-semibold">Game Type</h2>
          <p className="text-lg">{game.type}</p>
        </Card>
      )}
    </div>
  );
}
