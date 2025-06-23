"use client";

import { useEffect, useState } from "react";
import GamesGrid from "@/components/GamesGrid";
import UpcomingMatchesTable from "@/components/UpcomingMatchesTable";
import { Game, Match } from "@/lib/types/interfaces";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

const Homepage = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [errorGames, setErrorGames] = useState<string | null>(null);
  const [errorMatches, setErrorMatches] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (loadingGames || loadingMatches) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 300);
      return () => clearInterval(interval);
    }
  }, [loadingGames, loadingMatches]);

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
    async function fetchMatches() {
      try {
        const response = await fetch("/api/game-session?upcoming=true");
        if (!response.ok) {
          throw new Error("Failed to fetch matches");
        }
        const data = await response.json();
        console.log(data.sessions);
        setMatches(data.sessions);
      } catch (err) {
        console.error(err);
        setErrorMatches("Failed to fetch matches.");
      } finally {
        setLoadingMatches(false);
      }
    }
    fetchMatches();
  }, []);

  if (loadingGames || loadingMatches) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-500 text-lg mb-4">Loading data...</p>
        <Progress value={progress} className="w-64" />
      </div>
    );
  }

  if (errorGames || errorMatches) {
    return <div className="text-center text-red-500">{errorGames || errorMatches}</div>;
  }

  return (
    <div className="container mx-auto px-6 py-10">
      {/* Matches Section */}
      <h1 className="text-4xl font-semibold text-center text-gray-800 mb-8">Upcoming Matches</h1>
      <Card className="mb-10">
        <CardContent className="p-4">
          <UpcomingMatchesTable matches={matches} />
        </CardContent>
      </Card>

      {/* Games Section */}
      <h1 className="text-4xl font-semibold text-center text-gray-800 mb-8">Games List</h1>
      <GamesGrid games={games} />
    </div>
  );
};

export default Homepage;
