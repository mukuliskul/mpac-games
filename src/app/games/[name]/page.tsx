"use client";

import { Users } from "lucide-react";
import { use, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import LeaderboardTable from "@/components/LeaderboardTable";
import type { Game, Leaderboard, Event } from "@/lib/types/interfaces";
import { useAtomValue } from "jotai";
import { usernameAtom } from "@/state/usernameAtom";
import { currentEditionAtom, editionStartDateAtom, enrollmentEndDateAtom } from "@/state/editionAtom";
import { checkEnrollmentOpen, slugify } from "@/lib/utils";
import { EventStatus } from "@/lib/types/enums";
import Link from "next/link";
import { Countdown } from "@/components/Countdown";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";

export default function GamePage({
  params,
}: Readonly<{ params: Promise<{ name: string }> }>) {
  const { name } = use(params);
  const router = useRouter();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [generatingTournamentLoader, setGeneratingTournamentLoader] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState<boolean>(false);
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [enrolledPlayersCount, setEnrolledPlayersCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
  const [isTournamentOpen, setIsTournamentOpen] = useState<boolean>(false);
  const selectedUsername = useAtomValue(usernameAtom);
  const currentEdition = useAtomValue(currentEditionAtom)!
  const endEnrollmentDate = useAtomValue(enrollmentEndDateAtom)!
  const startEditionDate = useAtomValue(editionStartDateAtom)!;
  const [showAIModal, setShowAIModal] = useState(false);

  useEffect(() => {
    if (generatingTournamentLoader) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 300);
      return () => clearInterval(interval);
    }
  }, [generatingTournamentLoader]);

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


  async function enrollPlayer() {
    if (!event) {
      setError("Event not found");
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
        setError(errorData?.message || "Failed to enroll");
        return;
      }
    } catch (err: unknown) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
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
    if (event) {
      try {
        const response = await fetch(`/api/leaderboard?eventId=${event.id}`);
        if (!response.ok) throw new Error("Failed to fetch leaderboard");

        const data = await response.json();
        setLeaderboard(data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch leaderboard.');
      } finally {
        setLoading(false);
      }
    }
  }, [event]);

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


  const handleGenerateTournament = async () => {
    if (!event) {
      console.error("Event not found for tournament generation");
      return;
    }

    if (!game) {
      console.error("Game not found for tournament generation");
      return;
    }

    try {
      setGeneratingTournamentLoader(true);
      const res = await fetch(`/api/tournament/${event.id}/setup/${startEditionDate}`, {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.statusText}`);
      }

      const res2 = await fetch(`/api/event/${event.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: EventStatus.Started }),
      });

      if (!res2.ok) {
        throw new Error(`Error: ${res2.statusText}`);
      }

      checkIfTournamentOpen();
      router.push(`/tournament/${slugify(game?.name)}`);
    } catch (error) {
      setGeneratingTournamentLoader(false);
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

  // Loading and Error Handling UI
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center overflow-hidden">
        <Spinner />
      </div>
    );
  }

  if (generatingTournamentLoader) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-500 text-lg mb-4">Generating Tournament...</p>
        <Progress value={progress} className="w-64" />
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
          <div className="flex gap-2">
            {/* TODO: use admin roles from player interface instead */}
            {(selectedUsername?.toLowerCase() === "mukul" || selectedUsername?.toLowerCase() === "nina") && (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2"
                onClick={handleGenerateTournament}
                disabled={!isTournamentOpen}
              >
                Generate Tournament
              </Button>
            )}

            <Link href={`/tournament/${game.name.toLowerCase().replace(/\s+/g, '-')}`} passHref>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
              >
                View Tournament
              </Button>
            </Link>
          </div>
        </div>

        <Card className="shadow-md">
          <CardContent className="p-4">
            <LeaderboardTable leaderboard={leaderboard} />
          </CardContent>
        </Card>
      </div>

      {/* Enroll Button and AI Button next to each other */}
      <div className="flex flex-col items-center mt-6 space-y-2 text-sm text-muted-foreground">
        <div className="flex gap-3 w-full max-w-xs">
          <Button
            onClick={handleEnrollClick}
            disabled={isAlreadyEnrolled || !isEnrollmentOpen}
            className="flex-grow text-base font-medium"
          >
            {isAlreadyEnrolled
              ? "Already Enrolled"
              : !isEnrollmentOpen
                ? "Enrollment Closed"
                : "Enroll"}
          </Button>

          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95, rotate: -3 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <Button
              onClick={() => setShowAIModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold px-4 py-2 whitespace-nowrap"
            >
              🤖 Use AI to win
            </Button>
          </motion.div>
        </div>

        {/* Countdown (below the buttons) */}
        {isEnrollmentOpen && (
          <Countdown targetDate={endEnrollmentDate} />
        )}

        {/* Enrolled players count */}
        <div className="flex items-center mt-2">
          <Users className="w-4 h-4 mr-1" />
          <span className="tracking-tight">
            {enrolledPlayersCount} {enrolledPlayersCount === 1 ? "player" : "players"} enrolled
          </span>
        </div>

        {/* AI Modal */}
        {showAIModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl text-center space-y-4"
            >
              <h2 className="text-xl font-bold text-gray-800">🧠 Chill...</h2>
              <p className="text-gray-600 text-sm">
                Not every website needs AI, bro. 🙄
              </p>
              <Button onClick={() => setShowAIModal(false)} className="w-full">
                Fine, I’ll play fair
              </Button>
            </motion.div>
          </div>
        )}
      </div>    </div>
  );
}
