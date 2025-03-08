"use client";

import { use } from "react";

export default function Leaderboard({
  params,
}: Readonly<{
  params: Promise<{ name: string }>;
}>) {
  const { name } = use(params);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold">Leaderboard for {name}</h1>
    </div>
  );
}
