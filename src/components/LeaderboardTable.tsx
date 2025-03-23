import React from 'react';
import { useAtom } from 'jotai';
import { usernameAtom } from "@/state/usernameAtom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Leaderboard } from '@/lib/types/interfaces';

interface LeaderboardTableProps {
  leaderboard: Leaderboard[]; // Array of leaderboard entries
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ leaderboard }) => {
  const [selectedUsername] = useAtom(usernameAtom);

  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (b.total_wins !== a.total_wins) {
      return b.total_wins - a.total_wins;
    }
    return new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime();
  });

  if (sortedLeaderboard.length === 0) {
    return <p className="text-center text-gray-500 text-lg">No leaderboard data available.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Rank</TableHead>
          <TableHead>Player</TableHead>
          <TableHead className="w-24">Wins</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedLeaderboard.map(({ username, total_wins }, index) => (
          <TableRow
            key={username}
            className={selectedUsername === username ? 'bg-yellow-200' : ''}
          >
            <TableCell>{index + 1}</TableCell>
            <TableCell>{username}</TableCell>
            <TableCell>{total_wins}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default LeaderboardTable;
