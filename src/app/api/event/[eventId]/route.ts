import { supabase } from "@/lib/supabase";

/**
 * POST /api/event/[eventId]
 *
 * Fetches an event by event ID 
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
  const { data, error } = await supabase
    .from("event")
    .select("*")
    .eq("id", eventId)
    .single();

  if (error) {
    console.error("Error fetching event", error);
    return new Response("Error fetching event", { status: 500 });
  }

  return new Response(JSON.stringify(data), { status: 200 });
}


