import { updateEventStatus, getEventStatus } from "@/lib/db";

/**
 * GET /api/event/[eventId]/status/
 *
 * eventId: string
 *
 * Fetches the current status of an event
*/
export async function GET(
  _request: Request,
  { params }: {
    params: Promise<{
      eventId: string
    }>
  }
) {
  const { eventId } = await params;

  try {
    const status = await getEventStatus(eventId);
    return new Response(JSON.stringify({ status }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching event status:", error);
    return new Response(JSON.stringify({ message: "Failed to fetch event status" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}


/**
 * POST /api/event/[eventId]/status/
 *
 * eventId: string
 * body: { status: EventStatus } // EventStatus = "open" | "started" | "closed"
 *
 * Updates the status of an event 
*/

export async function POST(
  request: Request,
  { params }: {
    params: Promise<{
      eventId: string
    }>
  }
) {
  const { eventId } = await params;

  try {
    const body = await request.json();
    const { status } = body;

    console.log(`Updating event ${eventId} status to ${status}`);
    const result = await updateEventStatus(eventId, status);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating status:", error);
    return new Response(JSON.stringify({ message: "Failed to update event status" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}


