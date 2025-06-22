import React, { useEffect, useState } from "react";

export const Countdown = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft("Enrollment closed");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft(
        `${days}d ${hours}h ${minutes}m ${seconds}s`
      );
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

