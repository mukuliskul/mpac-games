import { generateFirstRound } from "@/lib/generateBracket";

/**
 * POST /api/tournament/[eventId]/setup/[date]
 *
 * eventId: string
 * date: string
 *
 * Sets up the first round of a tournament for a specific eventId 
 * on a given date which is treated as the start date.
*/

export async function POST(
  _request: Request,
  { params }: {
    params: Promise<{
      eventId: string, date: string
    }>
  }
) {
  const { eventId, date } = await params;

  try {
    const result = await generateFirstRound(eventId, date);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating first round:", error);
    return new Response(JSON.stringify({ message: "Failed to generate matches" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}


