'use client';

import { Match } from "@/lib/types/interfaces";
import { useAtomValue } from "jotai";
import { usernameAtom } from "@/state/usernameAtom";
import { CheckCircle } from "lucide-react";

interface BracketViewProps {
  rounds: Match[][];
}

// Utility to get next power of 2 for total players
const getTotalRounds = (playerCount: number) => {
  const matchCount = Math.pow(2, Math.ceil(Math.log2(playerCount)));
  return Math.log2(matchCount);
};

export function BracketView({ rounds }: BracketViewProps) {
  const selectedUsername = useAtomValue(usernameAtom);
  const initialPlayerCount = rounds[0]?.length * 2 || 0;
  const totalRounds = getTotalRounds(initialPlayerCount);

  const cardHeightPx = 116;
  const cardGapPx = 16;

  return (
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

                  const renderPlayerCard = (
                    player: string | null | undefined,
                    matchWinner: string | null | undefined,
                    isInMatch: boolean,
                    matchId: string,
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
                      if (!player || hasWinner) return;

                      try {
                        const response = await fetch(`/api/game-session/${matchId}`, {
                          method: "PUT",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            winner: player,
                          }),
                        });

                        if (!response.ok) {
                          console.error("Failed to set winner");
                        }
                      } catch (error) {
                        console.error("Error setting winner", error);
                      }
                    };

                    return (
                      <div className={`w-full p-4 shadow-md rounded-xl text-sm relative flex items-center justify-between ${bgClass} ${textClass} ${borderClass} ${opacityClass}`}>
                        <div>
                          <strong>
                            {isInMatch && player === match?.player1
                              ? "Player 1"
                              : isInMatch && player === match?.player2
                                ? "Player 2"
                                : "Player"}
                            :
                          </strong>{" "}
                          {player || "TBD"}
                        </div>
                        {!hasWinner && player && isInMatch && (
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

                  return (
                    <div key={match ? `match - ${idx} ` : `placeholder - ${idx} `} className="flex flex-col items-center gap-2">
                      {match
                        ? <>
                          <div className="flex flex-col gap-2 w-full">
                            {renderPlayerCard(match.player1, match.winner, true, match.id)}
                            {renderPlayerCard(match.player2, match.winner, true, match.id)}
                            <div className="text-[11px] text-gray-400 text-center mt-1">
                              {match.date}
                            </div>
                          </div>
                        </>
                        : <>
                          {renderPlayerCard(null, null, false, "")}
                          {renderPlayerCard(null, null, false, "")}
                          <div className="text-xs text-gray-400 mt-1 opacity-50">TBD</div>
                        </>
                      }
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
