"use client";

import { useEffect, useState } from "react";
import GamesGrid from "@/components/GamesGrid";
import { Game, AggregateLeaderboard } from "@/lib/types/interfaces";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import LeaderboardTable from "@/components/LeaderboardTable";

const Homepage = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [leaderboard, setLeaderboard] = useState<AggregateLeaderboard[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [errorGames, setErrorGames] = useState<string | null>(null);
  const [errorLeaderboard, setErrorLeaderboard] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (loadingGames || loadingLeaderboard) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 300);
      return () => clearInterval(interval);
    }
  }, [loadingGames, loadingLeaderboard]);

  useEffect(() => {
    async function fetchGames() {
      try {
        const response = await fetch("/api/games");
        if (!response.ok) {
          throw new Error("Failed to fetch games");
        }
        const data = await response.json();
        setGames(data);
      } catch (err) {
        console.error(err);
        setErrorGames("Failed to fetch games.");
      } finally {
        setLoadingGames(false);
      }
    }
    fetchGames();
  }, []);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch("/api/leaderboard");
        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard");
        }
        const data = await response.json();
        setLeaderboard(data);
      } catch (err) {
        console.error(err);
        setErrorLeaderboard("Failed to fetch leaderboard.");
      } finally {
        setLoadingLeaderboard(false);
      }
    }
    fetchLeaderboard();
  }, []);

  if (loadingGames || loadingLeaderboard) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-500 text-lg mb-4">Loading data...</p>
        <Progress value={progress} className="w-64" />
      </div>
    );
  }

  if (errorGames || errorLeaderboard) {
    return <div className="text-center text-red-500">{errorGames || errorLeaderboard}</div>;
  }

  return (
    <div className="container mx-auto px-6 py-10">
      {/* Leaderboard Section */}
      <h1 className="text-4xl font-semibold text-center text-gray-800 mb-8">Leaderboard</h1>
      <Card className="mb-10">
        <CardContent className="p-4">
          <LeaderboardTable leaderboard={leaderboard} />
        </CardContent>
      </Card>

      {/* Games Section */}
      <h1 className="text-4xl font-semibold text-center text-gray-800 mb-8">Games List</h1>
      <GamesGrid games={games} />
    </div>
  );
};

export default Homepage;
