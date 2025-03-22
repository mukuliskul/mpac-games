"use client";

import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { usernameAtom } from "@/state/usernameAtom";
import { useRouter } from "next/navigation";
import { Player } from "@/lib/types/interfaces";

export default function Default() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useAtom(usernameAtom);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Retrieve the selected player from localStorage when the component loads
  useEffect(() => {
    const storedUsername = localStorage.getItem("selectedPlayer");
    if (storedUsername) {
      setSelectedPlayer(storedUsername);
    }
  }, [setSelectedPlayer]);

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
          setError("Failed to fetch players.");
        } else {
          setError("An unexpected error occurred.");
        }
      }
    }
    fetchPlayers();
  }, []);

  const handleProceed = () => {
    if (selectedPlayer) {
      // Store the selected player in localStorage
      localStorage.setItem("selectedPlayer", selectedPlayer);
      router.push("/home");
    }
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl mb-4">Select Your Username</h1>
      <select
        className="p-2 border rounded"
        value={selectedPlayer || ""}
        onChange={(e) => setSelectedPlayer(e.target.value)}
      >
        <option value="">-- Select Player --</option>
        {players.map((player, index) => (
          <option key={index} value={player.username}>
            {player.username}
          </option>
        ))}
      </select>
      <button
        onClick={handleProceed}
        disabled={!selectedPlayer}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        Proceed
      </button>
    </div>
  );
}
