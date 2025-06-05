'use client';

import { Match } from "@/lib/types/interfaces";
import { Card, CardContent } from "@/components/ui/card";

// TODO: Replace this with actual jotai instance
const loggedInUsername = "Mukul";

interface BracketViewProps {
  rounds: Match[][];
}

// Utility to get next power of 2 for total players
const getTotalRounds = (playerCount: number) => {
  const matchCount = Math.pow(2, Math.ceil(Math.log2(playerCount)));
  return Math.log2(matchCount);
};

export function BracketView({ rounds }: BracketViewProps) {
  const initialPlayerCount = rounds[0]?.length * 2 || 0;
  const totalRounds = getTotalRounds(initialPlayerCount);

  const getRoundLabel = (index: number): string => {
    if (index === totalRounds - 1) return "Final";
    if (index === totalRounds - 2) return "Semi Final";
    return `Round ${index + 1}`;
  };

  return (
    <div className="flex overflow-x-auto gap-4 px-4 py-6">
      {Array.from({ length: totalRounds }).map((_, roundIndex) => {
        const matches = rounds[roundIndex] || [];

        return (
          <div key={roundIndex} className="flex flex-col gap-4 min-w-[250px]">
            <h2 className="text-lg font-bold text-center">
              {getRoundLabel(roundIndex)}
            </h2>

            {matches.length > 0 ? (
              matches.map((match, index) => (
                <Card key={index} className="p-4 shadow-md">
                  <CardContent className="space-y-1 text-sm">
                    <div>
                      <strong>Player 1:</strong>{" "}
                      <span className={match.player1 === loggedInUsername ? "text-blue-600 font-semibold" : ""}>
                        {match.player1}
                      </span>
                    </div>
                    <div>
                      <strong>Player 2:</strong>{" "}
                      <span className={match.player2 === loggedInUsername ? "text-blue-600 font-semibold" : ""}>
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
              ))
            ) : (
              // Placeholder match cards
              Array.from({ length: Math.pow(2, totalRounds - roundIndex - 1) / 1 }).map((_, index) => (
                <Card key={index} className="p-4 shadow-md bg-gray-50 text-gray-400">
                  <CardContent className="space-y-1 text-sm">
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
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}
