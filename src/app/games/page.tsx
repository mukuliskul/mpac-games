"use client";

import { useEffect, useState } from "react";

export default function GamesPage() {
	const [games, setGames] = useState([]);

	useEffect(() => {
		async function fetchGames() {
			const response = await fetch("/api/games");
			const data = await response.json();
			setGames(data);
		}

		fetchGames();
	}, []);

	return (
		<div>
			<h1 className="text-3xl font-bold">Games List</h1>
			<ul>
				{games.map((game: { id: string; name: string }) => (
					<li key={game.id}>{game.name}</li>
				))}
			</ul>
		</div>
	);
}
