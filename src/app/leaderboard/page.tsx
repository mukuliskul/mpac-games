"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AggregateLeaderboard } from "@/lib/types/interfaces";
import { Spinner } from '@/components/ui/spinner';

export default function AggregateLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<AggregateLeaderboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (b.total_wins !== a.total_wins) {
      return b.total_wins - a.total_wins; // Sort by total_wins (descending)
    }
    return new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime(); // If tied, sort by last_updated (descending)
  });

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
      <div className="flex flex-col items-center justify-center h-screen">
        <Spinner />;
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Title and Button Row */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">
          Leaderboard
        </h1>
      </div>

      {/* Leaderboard Table */}
      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="w-24">Wins</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLeaderboard.map(({ username, total_wins }, index) => (
                <TableRow key={username}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{username}</TableCell>
                  <TableCell>{total_wins}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

