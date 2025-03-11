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
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session, index) => (
            <Card
              key={session.id}
              className={`p-4 border rounded-xl shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl ${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                }`}
            >
              <CardHeader className="text-center">
                <h3 className="text-xl font-bold text-gray-800">Slot {index + 1}</h3>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>🕒 Start Time:</strong> {convertTimetzTo12HourFormat(session.start_time)}</p>
                <p><strong>⏳ End Time:</strong> {convertTimetzTo12HourFormat(session.end_time)}</p>
                <p className={`font-semibold ${session.status === "Open" ? "text-green-600" : "text-red-600"}`}>
                  <strong>📌 Status:</strong> {session.status}
                </p>
                <p><strong>👥 Enrolled:</strong> {session.enrolled_count}</p>
                <Button className="w-full mt-2">Join Session</Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center text-gray-600">No sessions available for {selectedDay}</div>
        )}
      </div>
    </div>
  );
}
