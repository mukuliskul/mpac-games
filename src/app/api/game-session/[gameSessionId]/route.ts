/**
 * PUT /api/game-session/[gameSessionId]/
 *
 * gameSessionId: string
 * body: { winner: string } 
 *
 * Updates the winner of a game session
*/

import { updateWinner } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: {
    params: Promise<{
      gameSessionId: string
    }>
  }
) {
  const { gameSessionId } = await params;

  try {
    const body = await request.json();
    const { winner } = body;

    console.log(`Updating game session ${gameSessionId} winner to ${winner}`);
    const result = await updateWinner(gameSessionId, winner);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating game session winner:", error);
    return new Response(JSON.stringify({ message: "Failed to update game session winner" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
