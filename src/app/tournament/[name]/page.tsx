"use client";

import { BracketView } from "@/components/BracketView";
import { useAtomValue } from "jotai";
import { currentEditionAtom } from "@/state/editionAtom";
import { use, useEffect, useState } from "react";
import type { Event, Match } from "@/lib/types/interfaces";
import { Spinner } from "@/components/ui/spinner";


export default function TournamentPage({
  params,
}: Readonly<{ params: Promise<{ name: string }> }>) {
  const { name } = use(params);
  const currentEdition = useAtomValue(currentEditionAtom)!
  const [event, setEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rounds, setRounds] = useState<Match[][] | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  // TODO: test if tournament brackets are rendered correctly when there are players only for round 1, round 1 and 2 etc etc
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


  // TODO: next round trigger should happen automatically when all matches are completed
  useEffect(() => {
    async function fetchRounds() {
      if (!event) return;

      const fetchedRounds: Match[][] = [];
      let round = 1;

      while (true) {
        const response = await fetch(`/api/game-session/${event.id}/${round}`);

        if (!response.ok) {
          console.error(`Error fetching round ${round}:`, response.status);
          break;
        }

        const matchesData: Match[] = await response.json();

        if (!matchesData || matchesData.length === 0) {
          break; // No more rounds to fetch
        }

        fetchedRounds.push(matchesData);
        round++;
      }

      setRounds(fetchedRounds);
      setLoading(false);
    }

    fetchRounds();
  }, [event]);

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

  return (
    <div>
      {rounds.length === 0 || rounds[0]?.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center mt-20 text-gray-500">
          <div className="text-4xl mb-4">🕒</div>
          <p className="text-lg font-medium">No matches have been scheduled yet.</p>
          <p className="text-sm text-gray-400 mt-1">
            Once the tournament begins, brackets and match details will appear here.
          </p>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-center mt-6">Tournament Bracket</h1>
          <BracketView rounds={rounds} />
        </>
      )}
    </div>
  );
}
