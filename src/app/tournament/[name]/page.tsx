"use client";

import { getAllRounds, getMatchesForRound } from "@/lib/db";
import { BracketView } from "@/components/BracketView";
import { useAtomValue } from "jotai";
import { currentEditionAtom } from "@/state/editionAtom";
import { use, useEffect, useState } from "react";
import type { Event, Match } from "@/lib/types/interfaces";


export default function TournamentPage({
  params,
}: Readonly<{ params: Promise<{ name: string }> }>) {
  const { name } = use(params);
  const currentEdition = useAtomValue(currentEditionAtom)!
  const [event, setEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rounds, setRounds] = useState<Match[][]>([]);


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


  useEffect(() => {
    async function fetchRounds() {
      // Ensure event is loaded before fetching rounds
      if (!event) return;

      const fetchedRounds: Match[][] = [];
      let round = 1;
      while (true) {
        // TODO: order by dates in asc
        // TODO: move the logic for get matches for round to a nextjs endpoint
        const matches = await getMatchesForRound(event.id, round);
        if (!matches || matches.length === 0) break;
        fetchedRounds.push(matches);
        round++;
      }
      setRounds(fetchedRounds);
    }
    fetchRounds();
  }, [event]);

  if (error) {
    return <div className="text-center text-red-600">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mt-6">Tournament Bracket</h1>
      <BracketView rounds={rounds} />
    </div>
  );
}
