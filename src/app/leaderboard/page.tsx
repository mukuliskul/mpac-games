"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { Leaderboard } from "@/lib/types/interfaces";
import { Spinner } from '@/components/ui/spinner';
import LeaderboardTable from "@/components/LeaderboardTable";

export default function AggregateLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const response = await fetch(`/api/leaderboard`);
        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard");
        }
        const data = await response.json();
        setLeaderboard(data);
      } catch (err: unknown) {
        console.log(err);
        if (err instanceof Error) {
          setError('Failed to fetch leaderboard.');
        } else {
          setError('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center overflow-hidden">
        <Spinner />;
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto px-6 py-10">
      {/* Title and Button Row */}
      <div className="flex justify-center items-center mb-4">
        <h1 className="text-3xl font-bold">
          Aggregate Leaderboard
        </h1>
      </div>

      {/* Leaderboard Table */}
      <Card>
        <CardContent className="p-4">
          <LeaderboardTable leaderboard={leaderboard} />
        </CardContent>
      </Card>
    </div>
  );
}
