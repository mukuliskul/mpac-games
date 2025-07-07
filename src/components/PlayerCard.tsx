"use client";

import { useAtomValue } from "jotai";
import { usernameAtom } from "@/state/usernameAtom";
import { CheckCircle, RefreshCcw } from "lucide-react";

interface PlayerCardProps {
  player: string | null | undefined;
  matchWinner: string | null | undefined;
  isInMatch: boolean;
  isUser: boolean;
  onSetWinner?: () => void;
  onReschedule?: () => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  matchWinner,
  isInMatch,
  isUser,
  onSetWinner,
  onReschedule,
}) => {
  const selectedUsername = useAtomValue(usernameAtom);
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
  const isPrivilegedUser = selectedUsername?.toLowerCase() === "nina" || selectedUsername?.toLowerCase() === "mukul";

  return (
    <div
      className={`w-full p-4 shadow-md rounded-xl text-sm relative flex items-center justify-between ${bgClass} ${textClass} ${borderClass} ${opacityClass}`}
    >
      <div>{player || "TBD"}</div>

      <div className="flex items-center gap-1 ml-2">
        {!hasWinner && player && isInMatch && isPrivilegedUser && onReschedule && (
          <button
            onClick={onReschedule}
            className="text-gray-400 hover:text-blue-500 transition"
            title="Reschedule match"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
        )}
        {!hasWinner && player && isInMatch && isPrivilegedUser && onSetWinner && (
          <button
            onClick={onSetWinner}
            className="text-gray-400 hover:text-green-600 transition"
            title="Mark as winner"
          >
            <CheckCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
