"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Leaderbaord } from "@/lib/types/interfaces";
import { Spinner } from '@/components/ui/spinner';

export default function Leaderboard({
  params,
}: Readonly<{
  params: Promise<{ name: string }>;
}>) {
  const { name } = use(params);
  const [leaderboard, setLeaderboard] = useState<Leaderbaord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch(`/api/games/${name}/leaderboard`);
        console.log(response);
        if (!response.ok) throw new Error("Failed to fetch leaderboard");
        const data = await response.json();
        setLeaderboard(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [name]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Spinner />;
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Leaderboard for {name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()}</h1>
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
              {leaderboard.map(({ username, wins }, index) => (
                <TableRow key={username}>
                  <TableCell>{index + 1}</TableCell> {/* Assign rank based on index */}
                  <TableCell>{username}</TableCell>
                  <TableCell>{wins}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
