"use client";

import { use } from "react";
import { useState, useEffect } from "react";

import { GameSession } from "@/lib/types/interfaces";

export default function Enroll({
  params,
}: Readonly<{
  params: Promise<{ name: string }>;
}>) {
  const { name } = use(params);
  const [gameSessions, setGameSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetching enroll
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
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-4xl font-semibold text-center text-gray-800 mb-8">Games List</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {gameSessions.map((session) => (
          <div key={session.id} className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800">{session.game_name}</h3>
            <p className="text-gray-600">Start Time: {session.start_time}</p>
            <p className="text-gray-600">End Time: {session.end_time}</p>
            <p className="text-gray-600">Status: {session.status}</p>
            <p className="text-gray-600">Enrolled: {session.enrolled_count}</p>
            <p className="text-gray-600">Day: {session.day}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
