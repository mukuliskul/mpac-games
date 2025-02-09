"use client";

import { useEffect, useState } from "react";
import { use } from "react";

type GamePageProps = {
	params: { name: string };
};

export default function Enroll({ params }: GamePageProps) {
	// State to hold the name value on the client side
	const [clientSideName, setClientSideName] = useState<string | null>(null);

	useEffect(() => {
		// Only set the name once the component has been mounted on the client side
		setClientSideName(params.name);
	}, [params.name]); // Re-run if params.name changes

	// Show loading or fallback while the client-side state is being set
	if (clientSideName === null) {
		return <div>Loading...</div>;
	}

	return (
		<div className="max-w-2xl mx-auto p-6">
			<h1 className="text-3xl font-bold">Enroll for {clientSideName}</h1>
		</div>
	);
}
