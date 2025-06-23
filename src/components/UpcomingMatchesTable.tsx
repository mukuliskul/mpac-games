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

  const upcomingMatches = matches
    .filter(match => match.winner === null && match.player1 !== "BYE" && match.player2 !== "BYE");

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
          <TableHead className="text-center">Game</TableHead> {/* new column */}
          <TableHead className="w-20 text-center">Round</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {upcomingMatches.map(({ id, player1, player2, round, date, game_name }) => {
          const isUserInMatch = selectedUsername === player1 || selectedUsername === player2;
          const matchLabel = (
            <>
              <span className={player1 === selectedUsername ? "font-semibold text-yellow-700" : ""}>
                {player1}
              </span>{" "}
              <span className="text-gray-400">vs</span>{" "}
              <span className={player2 === selectedUsername ? "font-semibold text-yellow-700" : ""}>
                {player2}
              </span>
            </>
          );

          return (
            <TableRow
              key={id}
              className={isUserInMatch ? "bg-yellow-50 hover:bg-yellow-100 transition" : ""}
            >
              <TableCell className="font-medium">{date}</TableCell>
              <TableCell>{matchLabel}</TableCell>
              <TableCell className="text-center">{game_name}</TableCell>
              <TableCell className="text-center">{round}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default UpcomingMatchesTable;
