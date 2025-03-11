"use client";

import { use } from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Spinner } from '@/components/ui/spinner';
import { GameSession } from "@/lib/types/interfaces";
import { convertTimetzTo12HourFormat } from "@/lib/utils";

export default function Enroll({
  params,
}: Readonly<{
  params: Promise<{ name: string }>;
}>) {
  const { name } = use(params);
  const [selectedDay, setSelectedDay] = useState<string>("Monday");
  const [gameSessions, setGameSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGameSessions() {
      try {
        const response = await fetch(`/api/games/${name}/session`);
        if (!response.ok) {
          throw new Error('Failed to fetch game sessions');
        }

        const data = await response.json();
        setGameSessions(data);
        setLoading(false);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError('Failed to fetch game sessions.');
        } else {
          setError('An unexpected error occurred.');
        }
        setLoading(false);
      }
    }

    fetchGameSessions();
  }, [name]);

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

  // Filter sessions by selected day
  const filteredSessions = gameSessions.filter(
    (session) => session.day === selectedDay
  );

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-4xl font-semibold text-center text-gray-800 mb-8">Game Sessions</h1>

      {/* Day Selector */}
      <div className="flex justify-center gap-4 mb-8">
        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
          <Button
            key={day}
            variant={selectedDay === day ? "primary" : "secondary"}
            onClick={() => setSelectedDay(day)}
          >
            {day}
          </Button>
        ))}
      </div>

      {/* Game Sessions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <h3 className="text-xl font-semibold">{session.game_name}</h3>
              </CardHeader>
              <CardContent>
                <p><strong>Start Time:</strong> {convertTimetzTo12HourFormat(session.start_time)}</p>
                <p><strong>End Time:</strong> {convertTimetzTo12HourFormat(session.end_time)}</p>
                <p><strong>Status:</strong> {session.status}</p>
                <p><strong>Enrolled:</strong> {session.enrolled_count}</p>
                <p><strong>Day:</strong> {session.day}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div>No sessions available for {selectedDay}</div>
        )}
      </div>
    </div>
  );
}
