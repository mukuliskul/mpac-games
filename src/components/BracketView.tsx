'use client';

import { Match } from "@/lib/types/interfaces";
import { Card, CardContent } from "@/components/ui/card";
import { useAtomValue } from "jotai";
import { usernameAtom } from "@/state/usernameAtom";

// TODO: add color highlighting for winner and loser?
// TODO: space the cards out more horizontally
// TODO: add lines if possible but not necessary

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

  // Measured height of a card including padding/border/shadow from DevTools
  const cardHeightPx = 116;
  // Tailwind gap-4 spacing in px (1rem = 16px)
  const cardGapPx = 16;

  return (
    <div className="w-full overflow-x-auto">
      {/* Ensure parent container tall enough for vertical centering */}
      <div className="flex justify-center min-h-[600px]">
        <div className="flex gap-4 px-4 py-6">
          {Array.from({ length: totalRounds }).map((_, roundIndex) => {
            const matches = rounds[roundIndex] || [];
            const totalMatchesInRound = Math.pow(2, totalRounds - roundIndex - 1);
            // Total height includes cards plus gaps between them
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
                  if (match) {
                    return (
                      <Card key={idx} className="min-h-[116px] p-4 shadow-md">
                        <CardContent className="p-4 space-y-1 text-sm flex flex-col justify-center w-full">
                          <div>
                            <strong>Player 1:</strong>{" "}
                            <span
                              className={
                                match.player1 === selectedUsername
                                  ? "text-blue-600 font-semibold"
                                  : ""
                              }
                            >
                              {match.player1}
                            </span>
                          </div>
                          <div>
                            <strong>Player 2:</strong>{" "}
                            <span
                              className={
                                match.player2 === selectedUsername
                                  ? "text-blue-600 font-semibold"
                                  : ""
                              }
                            >
                              {match.player2}
                            </span>
                          </div>
                          <div>
                            <strong>Date:</strong> {match.date}
                          </div>
                          <div>
                            <strong>Winner:</strong> {match.winner ?? "TBD"}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  } else {
                    return (
                      <Card
                        key={`placeholder-${idx}`}
                        className="min-h-[116px] p-4 shadow-md bg-gray-50 text-gray-400"
                      >
                        <CardContent className="p-4 space-y-1 text-sm flex flex-col justify-center w-full">
                          <div>
                            <strong>Player 1:</strong> TBD
                          </div>
                          <div>
                            <strong>Player 2:</strong> TBD
                          </div>
                          <div>
                            <strong>Date:</strong> TBD
                          </div>
                          <div>
                            <strong>Winner:</strong> TBD
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
