"use client";

import { use } from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Spinner } from '@/components/ui/spinner';
import { GameSession } from "@/lib/types/interfaces";
import { convertTimetzTo12HourFormat, getWeekdayName } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useCallback } from 'react';
import { Player } from "@/lib/types/interfaces";
import { Eye } from "lucide-react";


export default function Enroll({
  params,
}: Readonly<{
  params: Promise<{ name: string }>;
}>) {
  const { name } = use(params);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameSessions, setGameSessions] = useState<GameSession[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("Monday");
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<GameSession | null>(null);
  const [userName, setUserName] = useState("");
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

  const fetchGameSessions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/games/${name}/session`);
      if (!response.ok) {
        throw new Error("Failed to fetch game sessions");
      }
      const data = await response.json();
      setGameSessions(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("Failed to fetch game sessions.");
      } else {
        setError("An unexpected error occurred.");
      }
    }
    setLoading(false);
  }, [name]);

  useEffect(() => {
    fetchGameSessions();
  }, [fetchGameSessions]);

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

  const openEnrollModal = (session: GameSession) => {
    setSelectedSession(session);
    setIsEnrollModalOpen(true);
    setSubmitError(null);
  };

  const handleCloseEnrollModal = () => {
    setIsEnrollModalOpen(false);
    setSubmitError(null);
  };

  const handleEnrollSubmit = async () => {
    if (!userName.trim()) {
      setSubmitError("Please enter your name");
      return;
    }

    try {
      const response = await fetch(`/api/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: selectedSession?.id,
          name: userName
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Make sure the error message is a string, not an object
        setSubmitError(errorData?.message || "Failed to enroll");
        return;
      }

      setSubmitError(null);
      setIsEnrollModalOpen(false);
      setUserName("");
      await fetchGameSessions();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-4xl font-semibold text-center text-gray-800 mb-8">Game Sessions for {name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()}</h1>

      {/* Day Selector */}
      <div className="flex justify-center mb-8">
        <div className="flex gap-3 p-2 bg-gray-100 rounded-full shadow-md overflow-x-auto">
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
            <Button
              key={day}
              variant={selectedDay === day ? "default" : "outline"}
              className={`px-5 py-2 rounded-full transition-all ${selectedDay === day ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-700 hover:bg-gray-200"
                }`}
              onClick={() => setSelectedDay(day)}
            >
              {day}
            </Button>
          ))}
        </div>
      </div>

      {/* Game Sessions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {gameSessions.filter(s => getWeekdayName(s.date) === selectedDay).map((session, index) => (
          <Card key={session.id} className="p-4 border rounded-xl shadow-lg">
            <CardHeader className="text-center">
              <h3 className="text-xl font-bold">Slot {index + 1}</h3>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>🕒 Start Time:</strong> {convertTimetzTo12HourFormat(session.start_time)}</p>
              <p><strong>⏳ End Time:</strong> {convertTimetzTo12HourFormat(session.end_time)}</p>
              <p>
                <strong>👥 Enrolled:</strong> {session.enrolled_count}
                {session.enrolled_count > 0 && (
                  <Eye className="inline ml-2 cursor-pointer" onClick={() => openViewModal(session)} />
                )}
              </p>
              <Button className="w-full mt-2" onClick={() => openEnrollModal(session)}>Join Session</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Popup */}
      <Dialog open={isEnrollModalOpen} onOpenChange={setIsEnrollModalOpen}>
        <DialogContent className="p-6 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">Join Game Session</DialogTitle>
          </DialogHeader>

          {/* Dropdown for selecting a name */}
          <Select value={userName} onValueChange={setUserName}>
            <SelectTrigger className="mt-4 p-2 border rounded-md w-full">
              <SelectValue placeholder="Select your name" />
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
            <Button variant="secondary" onClick={handleCloseEnrollModal}>Cancel</Button>
            <Button onClick={handleEnrollSubmit} className="bg-blue-600 text-white">Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
