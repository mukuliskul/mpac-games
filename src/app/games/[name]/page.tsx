"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from '@/components/ui/spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import LeaderboardTable from "@/components/LeaderboardTable";
import type { Game, Leaderboard, Player } from "@/lib/types/interfaces";

export default function GamePage({
  params,
}: Readonly<{
  params: Promise<{ name: string }>;
}>) {
  const router = useRouter();
  const { name } = use(params);
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [winner, setWinner] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGameByName() {
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
          setError('Failed to fetch game details.');
        } else {
          setError('An unexpected error occurred.');
        }
        setLoading(false);
      }
    }

    fetchGameByName();
  }, [name]);

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const response = await fetch("/api/players");
        if (!response.ok) {
          throw new Error("Failed to fetch players");
        }
        const data = await response.json();
        setPlayers(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError('Failed to fetch players.');
        } else {
          setError('An unexpected error occurred.');
        }
      }
    }
    fetchPlayers();
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/leaderboard?game=${name}`);
      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }
      const data = await response.json();
      setLeaderboard(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError('Failed to fetch leaderboard.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }, [name]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const openModal = () => {
    setIsModalOpen(true);
    setSubmitError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    if (!winner.trim()) {
      setSubmitError("Please enter your name");
      return;
    }

    try {
      const response = await fetch(`/api/leaderboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game: name,
          username: winner
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Make sure the error message is a string, not an object
        setSubmitError(errorData?.message || "Failed to enroll");
        return;
      }

      setSubmitError(null);
      setIsModalOpen(false);
      setWinner("");
      await fetchLeaderboard();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("An unexpected error occurred. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Spinner />;
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
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

      {/* Action Buttons */}
      <div className="flex justify-between mb-6">
        <Button
          onClick={() => router.push(`/games/${game.name.toLowerCase().replace(/\s+/g, '-')}/enroll`)}
          className="w-full"
        >
          Enroll
        </Button>
      </div>

      {game.modes && (
        <Card className="mb-6 p-4">
          <h2 className="text-2xl font-semibold">Game Modes:</h2>
          <p className="text-lg">{game.modes}</p>
        </Card>
      )}

      {/* Leaderboard */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold">
            Leaderboard for {game.name.charAt(0).toUpperCase() + game.name.slice(1).toLowerCase()}
          </h2>
          <Button className="bg-blue-600 text-white px-4 py-2" onClick={openModal}>
            Add Winner
          </Button>
        </div>

        {/* Leaderboard Table */}
        <Card>
          <CardContent className="p-4">
            <LeaderboardTable leaderboard={leaderboard} />
          </CardContent>
        </Card>
      </div>

      {/* Modal Popup for Adding Winner */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="p-6 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">Select name of the winner</DialogTitle>
          </DialogHeader>

          {/* Dropdown for selecting a winner */}
          <Select value={winner} onValueChange={setWinner}>
            <SelectTrigger className="mt-4 p-2 border rounded-md w-full">
              <SelectValue placeholder="Select winner" />
            </SelectTrigger>
            <SelectContent>
              {players.map((player, index) => (
                <SelectItem key={index} value={player.username}>
                  {player.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Error message */}
          {submitError && (
            <div className="mt-4 text-red-600 font-semibold text-sm">{submitError}</div>
          )}

          <DialogFooter className="flex justify-end space-x-2 mt-4">
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button onClick={handleSubmit} className="bg-blue-600 text-white">Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
