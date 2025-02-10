"use client";

export default function GamePage({
	params,
}: Readonly<{
	params: { name: string };
}>) {
	const id: string = params.name;

	return (
		<div className="max-w-2xl mx-auto p-6">
			<h1 className="text-3xl font-bold">Game ID: {params.name}</h1>
		</div>
	);
}
