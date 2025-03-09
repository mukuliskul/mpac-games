"use client";

import { use } from "react";
import { useState, useEffect } from "react";

export default function Enroll({
  params,
}: Readonly<{
  params: Promise<{ name: string }>;
}>) {
  const { name } = use(params);
  const [enroll, setEnroll] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetching enroll
  useEffect(() => {
    async function fetchEnroll() {
      const response = await fetch(`/api/games/${name}/enroll`);
      const data = await response.json();
      setEnroll(data);
      setLoading(false);
    }

    fetchEnroll();
  }, [name]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-4xl font-semibold text-center text-gray-800 mb-8">Games List</h1>
      {enroll.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">No enrollments found.</p>
      ) : (
        <h1 className="text-4xl font-bold text-center mb-6">{enroll.name}</h1>
      )}
    </div>
  );
}
