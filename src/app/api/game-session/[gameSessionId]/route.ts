import { rescheduleGame, updateWinner } from "@/lib/db";

/**
 * PUT /api/game-session/[gameSessionId]/
 *
 * gameSessionId: string
 * rescheduled: boolean (optional)
 * body: { winner: string } 
 *
 * Updates the winner of a game session or reschedules it.
*/
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
    const url = new URL(request.url);
    const reschedule = url.searchParams.get("reschedule") === "true";

    let result;
    if (reschedule) {
      console.log(`Rescheduling game session ${gameSessionId}`);
      result = await rescheduleGame(gameSessionId);
    } else {
      const body = await request.json();
      const { winner } = body;

      console.log(`Updating game session ${gameSessionId} winner to ${winner}`);
      result = await updateWinner(gameSessionId, winner);
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating game session", error);
    return new Response(JSON.stringify({ message: "Failed to update game session" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
