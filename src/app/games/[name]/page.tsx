"use client";

import { use, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import LeaderboardTable from "@/components/LeaderboardTable";
import type { Game, Leaderboard, Player, Event } from "@/lib/types/interfaces";
import { useAtom } from "jotai";
import { usernameAtom } from "@/state/usernameAtom";
import { CURRENT_EDITION } from "@/lib/constants";

// TODO: show game modes properly
export default function GamePage({
  params,
}: Readonly<{ params: Promise<{ name: string }> }>) {
  const { name } = use(params);
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [winner, setWinner] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedUsername] = useAtom(usernameAtom);

  // Fetch game details by name
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
        console.error(err);
        setError('Failed to fetch game details.');
        setLoading(false);
      }
    }

    fetchGameByName();
  }, [name]);

  // Fetch event by game name
  useEffect(() => {
    async function fetchEvent(
      edition: string = CURRENT_EDITION,
    ) {
      try {
        const response = await fetch(`/api/event?gameName=${name}&edition=${edition}`);
        if (!response.ok) throw new Error("Failed to fetch event");

        const data = await response.json();
        setEvent(data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch event.');
      }
    }

    fetchEvent();
  }, [name]);

  // Fetch players list
  useEffect(() => {
    async function fetchPlayers() {
      try {
        const response = await fetch("/api/players");
        if (!response.ok) throw new Error("Failed to fetch players");

        const data = await response.json();
        setPlayers(data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch players.');
      }
    }

    fetchPlayers();
  }, []);

  async function enrollPlayer() {
    try {
      const response = await fetch(`/api/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          name: selectedUsername,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setSubmitError(errorData?.message || "Failed to enroll");
        return;
      }
    } catch (err: unknown) {
      console.error(err);
      setSubmitError("An unexpected error occurred. Please try again.");
    }
  }

  // Fetch leaderboard for the game
  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/leaderboard?game=${name}`);
      if (!response.ok) throw new Error("Failed to fetch leaderboard");

      const data = await response.json();
      setLeaderboard(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch leaderboard.');
    } finally {
      setLoading(false);
    }
  }, [name]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Handle enroll button click
  const handleEnrollClick = async () => {
    try {
      await enrollPlayer();
    } catch (err) {
      console.error(err);
      alert("Failed to enroll. Please try again.");
    }
  };

  // Modal open/close handlers
  const openModal = () => {
    setIsModalOpen(true);
    setSubmitError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSubmitError(null);
  };

  // Handle winner submission
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
        setSubmitError(errorData?.message || "Failed to enroll");
        return;
      }

      setSubmitError(null);
      setIsModalOpen(false);
      setWinner("");
      await fetchLeaderboard();
    } catch (err: unknown) {
      console.error(err);
      setSubmitError("An unexpected error occurred. Please try again.");
    }
  };

  // Loading and Error Handling UI
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600">{error}</div>;
  }

  if (!game) {
    return <div className="text-center">Game not found!</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Game Title */}
      <h1 className="text-4xl font-bold text-center mb-6">{game.name}</h1>

      {/* Game Description and Modes Combined */}
      <Card className="mb-6 p-4 shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Description</h2>
        <p className="text-lg">{game.description}</p>

        {game.modes && (
          <>
            <h2 className="text-2xl font-semibold mt-6 mb-4">Game Modes</h2>
            <p className="text-lg">{game.modes}</p>
          </>
        )}
      </Card>

      {/* Leaderboard Section */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold">Leaderboard</h2>
          {selectedUsername?.toLowerCase() === "mukul" || selectedUsername?.toLowerCase() === "nina" ? (
            <Button className="bg-blue-600 text-white px-4 py-2" onClick={openModal}>
              Add Winner
            </Button>
          ) : null}
        </div>

        <Card className="shadow-md">
          <CardContent className="p-4">
            <LeaderboardTable leaderboard={leaderboard} />
          </CardContent>
        </Card>
      </div>

      {/* TODO: Add disabled state for the button when the player is already enrolled */}
      {/* Enroll Button */}
      <div className="flex justify-center mt-6">
        <Button
          onClick={handleEnrollClick}
          // disabled={!event || event.enrolled_count >= event.max_players}
          className="w-full max-w-xs"
        >
          Enroll
        </Button>
      </div>

      {/* Modal for Selecting Winner */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="p-6 rounded-xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">Select Name of the Winner</DialogTitle>
          </DialogHeader>

          <div className="mt-4 w-full">
            <Select value={winner} onValueChange={setWinner}>
              <SelectTrigger className="p-2 border rounded-md w-full">
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
          </div>

          {/* Submit Error Message */}
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
