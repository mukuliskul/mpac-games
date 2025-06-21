"use client";

import { Users } from "lucide-react";
import { use, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import LeaderboardTable from "@/components/LeaderboardTable";
import type { Game, Leaderboard, Player, Event } from "@/lib/types/interfaces";
import { useAtomValue } from "jotai";
import { usernameAtom } from "@/state/usernameAtom";
import { currentEditionAtom, editionStartDateAtom, enrollmentEndDateAtom } from "@/state/editionAtom";
import { checkEnrollmentOpen } from "@/lib/utils";
import { EventStatus } from "@/lib/types/enums";

export default function GamePage({
  params,
}: Readonly<{ params: Promise<{ name: string }> }>) {
  const { name } = use(params);
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState<boolean>(false);
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [enrolledPlayersCount, setEnrolledPlayersCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTournamentOpen, setIsTournamentOpen] = useState<boolean>(false);
  const [winner, setWinner] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const selectedUsername = useAtomValue(usernameAtom);
  const currentEdition = useAtomValue(currentEditionAtom)!
  const endEnrollmentDate = useAtomValue(enrollmentEndDateAtom)!
  const startEditionDate = useAtomValue(editionStartDateAtom)!;

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
    async function fetchEvent() {
      try {
        // Wait for currentEdition to load
        if (!currentEdition) {
          return;
        }

        const response = await fetch(`/api/event?gameName=${name}&edition=${currentEdition}`);
        if (!response.ok) throw new Error("Failed to fetch event");

        const data = await response.json();

        if (!data || Object.keys(data).length === 0) {
          setError("Event not found.");
          return;
        }

        setEvent(data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch event.');
      }
    }

    fetchEvent();
  }, [name, currentEdition]);

  const checkIfEnrolled = useCallback(async () => {
    if (!event || !selectedUsername) return;

    try {
      const response = await fetch(
        `/api/enroll/${event.id}/${selectedUsername}`
      );

      if (!response.ok) {
        // Check for specific status or handle response status accordingly
        if (response.status === 404) {
          // Player not found, mark as not enrolled
          setIsAlreadyEnrolled(false);
          return;
        }
        throw new Error("Failed to check enrollment");
      }

      const data = await response.json();

      // If data is empty or doesn't contain the expected fields
      if (data || data.username || data.event_id) {
        setIsAlreadyEnrolled(true); // Player is enrolled
      }
    } catch (err) {
      console.error("Failed to check enrollment", err);
      setIsAlreadyEnrolled(false); // Fallback: allow enroll
    }
  }, [event, selectedUsername]);

  useEffect(() => {
    checkIfEnrolled();
  }, [checkIfEnrolled]);

  const checkTotalEnrollmentCount = useCallback(async () => {
    if (!event) return;

    try {
      const response = await fetch(
        `/api/enroll/${event.id}/count`
      );

      if (!response.ok) {
        throw new Error("Failed to check total enrollment count");
      }

      const data = await response.json();
      setEnrolledPlayersCount(data.count);
    } catch (err) {
      console.error("Failed to check total enrollment count", err);
    }
  }, [event]);

  useEffect(() => {
    checkTotalEnrollmentCount();
  }, [checkTotalEnrollmentCount]);

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
    if (!event) {
      setSubmitError("Event not found");
      return;
    }
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

  // **Ensure the enrollment check happens only on the client side**
  useEffect(() => {
    if (typeof window !== "undefined" && endEnrollmentDate) {
      const isOpen = checkEnrollmentOpen(endEnrollmentDate);
      setIsEnrollmentOpen(isOpen);
    }
  }, [endEnrollmentDate]);


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
      await checkIfEnrolled();
      await checkTotalEnrollmentCount();
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

  const handleGenerateTournament = async () => {
    if (!event) {
      console.error("Event not found for tournament generation");
      return;
    }

    try {
      const res = await fetch(`/api/tournament/${event.id}/setup/${startEditionDate}`, {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.statusText}`);
      }

      const data = await res.json();
      console.log('Tournament generated:', data);

      const res2 = await fetch(`/api/event/${event.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: EventStatus.Started }),
      });

      if (!res2.ok) {
        throw new Error(`Error: ${res2.statusText}`);
      }
      checkIfTournamentOpen();
    } catch (error) {
      console.error('Failed during handling with error:', error);
    }
  };

  const checkIfTournamentOpen = useCallback(async () => {
    if (!event) {
      return;
    }

    try {
      const response = await fetch(`/api/event/${event.id}/status`);
      if (!response.ok) throw new Error("Failed to check tournament status");

      const data = await response.json();
      setIsTournamentOpen(data.status === EventStatus.Open); // disable if not open
    } catch (err) {
      console.error("Failed to check tournament status", err);
      setIsTournamentOpen(false);
    }
  }, [event]);

  useEffect(() => {
    checkIfTournamentOpen();
  }, [checkIfTournamentOpen]);

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
      </Card>

      {/* TODO: add instructions to game page */}
      {/* Leaderboard Section */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold">Leaderboard</h2>
          {selectedUsername?.toLowerCase() === "mukul" || selectedUsername?.toLowerCase() === "nina" ? (
            <div className="flex gap-2">
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2"
                onClick={handleGenerateTournament}
                disabled={!isTournamentOpen}
              >
                Generate Tournament
              </Button>
              <Button className="bg-blue-600 text-white px-4 py-2" onClick={openModal}>
                Add Winner
              </Button>
            </div>
          ) : null}
        </div>

        <Card className="shadow-md">
          <CardContent className="p-4">
            <LeaderboardTable leaderboard={leaderboard} />
          </CardContent>
        </Card>
      </div>

      {/* Enroll Button */}
      <div className="flex flex-col items-center mt-6 space-y-2 text-sm text-muted-foreground">
        <Button
          onClick={handleEnrollClick}
          disabled={isAlreadyEnrolled || !isEnrollmentOpen}
          className="w-full max-w-xs text-base font-medium"
        >
          {isAlreadyEnrolled
            ? "Already Enrolled"
            : !isEnrollmentOpen
              ? "Enrollment Closed"
              : "Enroll"}
        </Button>

        {/* Player Count */}
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-1" />
          <span className="tracking-tight">
            {enrolledPlayersCount} {enrolledPlayersCount === 1 ? "player" : "players"} enrolled
          </span>
        </div>
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
