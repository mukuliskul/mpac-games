"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Game } from "@/lib/types/interfaces";

const gradients = [
  "bg-gradient-to-r from-purple-500 to-pink-500",
  "bg-gradient-to-r from-blue-500 to-green-500",
  "bg-gradient-to-r from-orange-500 to-red-500",
  "bg-gradient-to-r from-yellow-400 to-pink-500",
  "bg-gradient-to-r from-indigo-500 to-cyan-500",
];

const GamesGrid = ({
  games
}: {
  games: Game[]
}) => {
  if (games.length === 0) {
    return (
      <div className="text-center text-gray-500 text-lg">
        No games found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {games
        .filter((game) => game.is_active)
        .map((game, index) => (
          <motion.div
            key={game.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative group cursor-pointer"
          >
            <Link href={`/games/${game.name.toLowerCase().replace(/\s+/g, '-')}`} passHref>
              <Card className={cn("rounded-2xl overflow-hidden shadow-lg transition-all duration-300", gradients[index % gradients.length])}>
                <div className="relative w-full h-60 bg-gray-800">
                  <Image
                    src={game.image_url}
                    alt={game.name}
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-t-2xl"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold tracking-wide text-white drop-shadow-lg">
                    {game.name}
                  </CardTitle>
                </CardHeader>
                <div className="absolute -inset-1 rounded-2xl bg-white opacity-10 blur-md transition-all duration-300 group-hover:opacity-20" />
              </Card>
            </Link>
          </motion.div>
        ))}
    </div>
  );
};

export default GamesGrid;

