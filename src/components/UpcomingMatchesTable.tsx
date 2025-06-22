import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Match } from "@/lib/types/interfaces";
import { useAtomValue } from "jotai";
import { usernameAtom } from "@/state/usernameAtom";


const UpcomingMatchesTable = ({
  matches
}: {
  matches: Match[]
}) => {
  const selectedUsername = useAtomValue(usernameAtom);
  console.log("UpcomingMatchesTable matches:", matches);

  const upcomingMatches = matches
    .filter(match => match.winner === null)
    .sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

  if (upcomingMatches.length === 0) {
    return (
      <p className="text-center text-gray-500 text-lg">
        No upcoming games scheduled.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-24">Date</TableHead>
          <TableHead>Match</TableHead>
          <TableHead className="w-20 text-center">Round</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {upcomingMatches.map(({ id, player1, player2, round, date }) => {
          const isCurrentUserInMatch =
            selectedUsername === player1 || selectedUsername === player2;

          return (
            <TableRow
              key={id}
              className={isCurrentUserInMatch ? "bg-yellow-100" : ""}
            >
              <TableCell>{date}</TableCell>
              <TableCell>
                {player1} <span className="text-gray-400">vs</span> {player2}
              </TableCell>
              <TableCell className="text-center">{round}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default UpcomingMatchesTable;
