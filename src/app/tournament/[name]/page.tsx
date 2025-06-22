"use client";

import { useAtomValue } from "jotai";
import { currentEditionAtom } from "@/state/editionAtom";
import { usernameAtom } from "@/state/usernameAtom";
import { useEffect, useState, useCallback, use } from "react";
import type { Event, Match } from "@/lib/types/interfaces";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle } from "lucide-react";

//TODO: give extra points for winning the entire tournament?
export default function TournamentPage({
  params,
}: Readonly<{ params: Promise<{ name: string }> }>) {
  const { name } = use(params);
  const currentEdition = useAtomValue(currentEditionAtom)!;
  const selectedUsername = useAtomValue(usernameAtom);

  const [event, setEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rounds, setRounds] = useState<Match[][]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const cardHeightPx = 116;
  const cardGapPx = 16;

  const getTotalRounds = (playerCount: number) => {
    const matchCount = Math.pow(2, Math.ceil(Math.log2(playerCount)));
    return Math.log2(matchCount);
  };

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

  useEffect(() => {
    fetchRounds();
  }, [fetchRounds]);

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

  const renderPlayerCard = (
    player: string | null | undefined,
    matchWinner: string | null | undefined,
    isInMatch: boolean,
    matchId: string,
    roundIndex: number,
    idx: number
  ) => {
    const isUser = player === selectedUsername;
    const isPlaceholder = !player;
    const hasWinner = !!matchWinner;

    let bgClass = "bg-white";
    let textClass = "";
    let opacityClass = "";

    if (isPlaceholder) {
      bgClass = "bg-gray-50";
      textClass = "text-gray-400";
      opacityClass = "opacity-50";
    } else if (hasWinner && player === matchWinner) {
      bgClass = "bg-green-50";
      textClass = "text-green-600 font-semibold";
    } else if (hasWinner && isInMatch) {
      bgClass = "bg-red-50";
      textClass = "text-red-600";
      opacityClass = "opacity-50";
    }

    const borderClass = isUser ? "border border-blue-500" : "border border-transparent";

    const handleSetWinner = async () => {
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

        // Update the local rounds state
        const currentRoundMatches = [...rounds[roundIndex]];
        currentRoundMatches[idx] = {
          ...currentRoundMatches[idx],
          winner: player,
        };

        const isEven = idx % 2 === 0;
        const pairIdx = isEven ? idx + 1 : idx - 1;
        const currentMatch = currentRoundMatches[idx];
        currentMatch.winner = player; // Set current match winner
        const pairedMatch = currentRoundMatches[pairIdx];

        if (currentMatch?.winner && pairedMatch?.winner) {
          await fetch(`/api/tournament/${event.id}/next-round`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              round: roundIndex + 2, // Round is 0-indexed, so +2 for next round
              player1: isEven ? currentMatch.winner : pairedMatch.winner,
              player2: isEven ? pairedMatch.winner : currentMatch.winner,
            }),
          });
        }

        // Refresh brackets to reflect the updated state
        await fetchRounds();
      } catch (error) {
        console.error("Error setting winner", error);
      }
    };

    return (
      <div
        className={`w-full p-4 shadow-md rounded-xl text-sm relative flex items-center justify-between ${bgClass} ${textClass} ${borderClass} ${opacityClass}`}
      >
        <div>
          {player || "TBD"}
        </div>
        {!hasWinner &&
          player &&
          isInMatch &&
          (selectedUsername?.toLowerCase() === "nina" || selectedUsername?.toLowerCase() === "mukul") && (
            <button
              onClick={handleSetWinner}
              className="ml-2 text-gray-400 hover:text-green-600 transition"
              title="Mark as winner"
            >
              <CheckCircle className="w-5 h-5" />
            </button>
          )}
      </div>
    );
  };

  const initialPlayerCount = rounds[0]?.length * 2 || 0;
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

                        return (
                          <div
                            key={match ? `match-${idx}` : `placeholder-${idx}`}
                            className="flex flex-col items-center gap-2"
                          >
                            {match ? (
                              <div className="flex flex-col gap-2 w-full">
                                {renderPlayerCard(match.player1, match.winner, true, match.id, roundIndex, idx)}
                                {renderPlayerCard(match.player2, match.winner, true, match.id, roundIndex, idx)}
                                <div className="text-[11px] text-gray-400 text-center mt-1">
                                  {match.date}
                                </div>
                              </div>
                            ) : (
                              <>
                                {renderPlayerCard(null, null, false, "", roundIndex, idx)}
                                {renderPlayerCard(null, null, false, "", roundIndex, idx)}
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
