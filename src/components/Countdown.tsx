import { parseNYDateString } from "@/lib/date";
import React, { useEffect, useState } from "react";
import { DateTime } from "luxon";

export const Countdown = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState("");


  useEffect(() => {
    const target = parseNYDateString(targetDate);

    const updateCountdown = () => {
      const now = DateTime.local();

      if (target <= now) {
        setTimeLeft("Enrollment closed");
        return;
      }

      // Get difference as Duration
      const diff = target.diff(now, ['days', 'hours', 'minutes', 'seconds']).toObject();

      // Round values down
      const days = Math.floor(diff.days ?? 0);
      const hours = Math.floor(diff.hours ?? 0);
      const minutes = Math.floor(diff.minutes ?? 0);
      const seconds = Math.floor(diff.seconds ?? 0);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown(); // initial call
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <p className="text-sm text-center text-gray-600">
      Enrollment ends in: <span className="font-semibold">{timeLeft}</span>
    </p>
  );
};

