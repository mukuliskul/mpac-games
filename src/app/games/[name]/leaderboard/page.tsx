"use client";

export default function Leaderboard({
	params,
}: Readonly<{
	params: { name: string };
}>) {
	const name: string = params.name;

	return (
		<div className="max-w-2xl mx-auto p-6">
			<h1 className="text-3xl font-bold">Leaderboard for {name}</h1>
		</div>
	);
}
