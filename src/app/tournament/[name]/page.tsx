"use client";

import { useAtomValue } from "jotai";
import { currentEditionAtom } from "@/state/editionAtom";
import { usernameAtom } from "@/state/usernameAtom";
import { useEffect, useState, useCallback, use, useRef } from "react";
import type { Event, Match } from "@/lib/types/interfaces";
import { Spinner } from "@/components/ui/spinner";
import { PlayerCard } from "@/components/PlayerCard";

export default function TournamentPage({
  params,
}: Readonly<{ params: Promise<{ name: string }> }>) {
  const { name } = use(params);
  const [event, setEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rounds, setRounds] = useState<Match[][]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const cardHeightPx = 116;
  const cardGapPx = 16;
  const currentEdition = useAtomValue(currentEditionAtom)!;
  const selectedUsername = useAtomValue(usernameAtom);
  const initialPlayerCount = rounds[0]?.length * 2 || 0;
  const processedMatches = useRef(new Set<string>());

  useEffect(() => {
    async function fetchEvent() {
      if (!currentEdition) return;

      try {
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
        setError("Failed to fetch event.");
      }
    }

    fetchEvent();
  }, [name, currentEdition]);

  const fetchRounds = useCallback(async () => {
    if (!event) return;

    const fetchedRounds: Match[][] = [];
    let round = 1;

    while (true) {
      const response = await fetch(`/api/game-session/event/${event.id}/${round}`);

      if (!response.ok) {
        break;
      }

      const matchesData: Match[] = await response.json();
      if (!matchesData || matchesData.length === 0) break;

      fetchedRounds.push(matchesData);
      round++;
    }

    setRounds(fetchedRounds);
    setLoading(false);
  }, [event]);

  useEffect(() => {
    fetchRounds();
  }, [fetchRounds]);

  const handleSetWinner = useCallback(async (
    matchId: string,
    player: string,
    roundIndex: number,
    idx: number
  ) => {
    if (!event || !matchId || !player) return;

    try {
      const response = await fetch(`/api/game-session/${matchId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ winner: player }),
      });

      if (!response.ok) {
        console.error("Failed to set winner");
        return;
      }

      const currentRoundMatches = [...rounds[roundIndex]];
      const isEven = idx % 2 === 0;
      const pairIdx = isEven ? idx + 1 : idx - 1;
      const currentMatch = currentRoundMatches[idx];
      currentMatch.winner = player;
      const pairedMatch = currentRoundMatches[pairIdx];
      console.log("currentMatch:", currentMatch);
      console.log("pairedMatch:", pairedMatch);

      if (currentMatch?.winner && pairedMatch?.winner) {
        console.log(`Setting next round for match ${currentMatch.id} and ${pairedMatch.id}`);
        await fetch(`/api/tournament/${event.id}/next-round`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            round: roundIndex + 2,
            player1: isEven ? currentMatch.winner : pairedMatch.winner,
            player2: isEven ? pairedMatch.winner : currentMatch.winner,
          }),
        });
      }

      await fetchRounds();
    } catch (err) {
      console.error("Error setting winner", err);
    }
  }, [event, rounds, fetchRounds]);

  const handleReschedule = useCallback(
    async (matchId: string) => {
      if (!matchId || !event) return;

      try {
        const response = await fetch(`/api/game-session/${matchId}?reschedule=true`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.error("Failed to reschedule match");
          return;
        }

        await fetchRounds(); // Refresh state
      } catch (err) {
        console.error("Error rescheduling match", err);
      }
    },
    [event, fetchRounds]
  );

  const autoResolveByeMatch = useCallback(
    async (match: Match, roundIndex: number, idx: number) => {
      const { player1, player2, winner, id: matchId } = match;

      if (!matchId) return;
      if (winner) return;
      if (processedMatches.current.has(matchId)) return;  // Skip if already processed


      const isBye1 = player1 === "BYE";
      const isBye2 = player2 === "BYE";

      if (!isBye1 && !isBye2) return;

      const autoWinner = isBye1 && !isBye2 ? player2! :
        isBye2 && !isBye1 ? player1! :
          "BYE";

      processedMatches.current.add(matchId);  // Mark as processed BEFORE awaiting

      await handleSetWinner(matchId, autoWinner, roundIndex, idx);
    },
    [handleSetWinner]
  );

  useEffect(() => {
    if (!rounds.length) return;

    const resolveAllByes = async () => {
      for (let roundIndex = 0; roundIndex < rounds.length; roundIndex++) {
        const matches = rounds[roundIndex];

        for (let idx = 0; idx < matches.length; idx += 2) {
          const match1 = matches[idx];
          const match2 = matches[idx + 1];

          const promises = [];
          if (match1) promises.push(autoResolveByeMatch(match1, roundIndex, idx));
          if (match2) promises.push(autoResolveByeMatch(match2, roundIndex, idx + 1));
          await Promise.all(promises);

          // Wait a tick to ensure state sync
          await new Promise((res) => setTimeout(res, 20));
        }
      }
    };

    resolveAllByes();
  }, [rounds, autoResolveByeMatch]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center overflow-hidden">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600">{error}</div>;
  }

  const getTotalRounds = (playerCount: number) => {
    const matchCount = Math.pow(2, Math.ceil(Math.log2(playerCount)));
    return Math.log2(matchCount);
  };
  const totalRounds = getTotalRounds(initialPlayerCount);

  return (
    <div>
      {rounds.length === 0 || rounds[0]?.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center mt-20 text-gray-500">
          <div className="text-4xl mb-4">\uD83D\uDD52</div>
          <p className="text-lg font-medium">No matches have been scheduled yet.</p>
          <p className="text-sm text-gray-400 mt-1">
            Once the tournament begins, brackets and match details will appear here.
          </p>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-center mt-6">Tournament Bracket</h1>
          <div className="w-full overflow-x-auto">
            <div className="flex justify-center min-h-[600px]">
              <div className="flex justify-evenly w-full px-4 py-6">
                {Array.from({ length: totalRounds }).map((_, roundIndex) => {
                  const matches = rounds[roundIndex] || [];
                  const totalMatchesInRound = Math.pow(2, totalRounds - roundIndex - 1);
                  const totalHeightPx =
                    totalMatchesInRound * cardHeightPx + (totalMatchesInRound - 1) * cardGapPx;

                  return (
                    <div
                      key={roundIndex}
                      className="flex flex-col gap-4 min-w-[250px] justify-center"
                      style={{ minHeight: `${totalHeightPx}px` }}
                    >
                      {Array.from({ length: totalMatchesInRound }).map((_, idx) => {
                        const match = matches[idx];

                        // For vertical alignment: spacing increases by round depth
                        const spacerMultiplier = Math.pow(2, roundIndex) - 1;
                        const spacerHeight = (cardHeightPx + cardGapPx) * (spacerMultiplier / 2);

                        return (
                          <div
                            key={match ? `match-${idx}` : `placeholder-${idx}`}
                            className="flex flex-col items-center gap-2"
                            style={{
                              marginTop: roundIndex === 0 ? 0 : spacerHeight,
                              marginBottom: roundIndex === 0 ? cardGapPx : spacerHeight,
                            }}
                          >
                            {match ? (
                              <div className="flex flex-col gap-2 w-full">
                                <PlayerCard
                                  player={match.player1}
                                  matchWinner={match.winner}
                                  isInMatch={true}
                                  isUser={match.player1 === selectedUsername}
                                  onSetWinner={() => handleSetWinner(match.id, match.player1!, roundIndex, idx)}
                                />
                                <PlayerCard
                                  player={match.player2}
                                  matchWinner={match.winner}
                                  isInMatch={true}
                                  isUser={match.player2 === selectedUsername}
                                  onSetWinner={() => handleSetWinner(match.id, match.player2!, roundIndex, idx)}
                                />
                                <div className="text-[11px] text-gray-400 text-center mt-1">{match.date}</div>

                                {/* Reschedule Button */}
                                {(selectedUsername?.toLowerCase() === "mukul" || selectedUsername?.toLowerCase() === "nina") && (
                                  <button
                                    onClick={() => handleReschedule(match.id)}
                                    className="text-xs text-blue-500 hover:underline self-center"
                                  >
                                    Reschedule
                                  </button>
                                )}
                              </div>
                            ) : (
                              <>
                                <PlayerCard
                                  player={null}
                                  matchWinner={null}
                                  isInMatch={false}
                                  isUser={false}
                                />
                                <PlayerCard
                                  player={null}
                                  matchWinner={null}
                                  isInMatch={false}
                                  isUser={false}
                                />
                                <div className="text-xs text-gray-400 mt-1 opacity-50">TBD</div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
