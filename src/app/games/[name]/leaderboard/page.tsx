"use client";

import { useCallback, useEffect, useState } from "react";
import { use } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Leaderboard, Player } from "@/lib/types/interfaces";
import { Spinner } from '@/components/ui/spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function Leaderboard({
  params,
}: Readonly<{
  params: Promise<{ name: string }>;
}>) {
  const { name } = use(params);
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [winner, setWinner] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Title and Button Row */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">
          Leaderboard for {name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()}
        </h1>
        <Button className="bg-blue-600 text-white px-4 py-2" onClick={openModal}>
          Add Winner
        </Button>
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
              {leaderboard.map(({ username, wins }, index) => (
                <TableRow key={username}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{username}</TableCell>
                  <TableCell>{wins}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Popup */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="p-6 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">Select name of the winner</DialogTitle>
          </DialogHeader>

          {/* Dropdown for selecting a name */}
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

          {/* Error message displayed inside the modal */}
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
