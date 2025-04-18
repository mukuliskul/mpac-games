import { supabase } from "@/lib/supabase";
import { Enrollment } from "@/lib/types/interfaces";

/**
 * GET /api/enrollments
 *
 * eventId: string
 * Retrieves a list of enrollments for a specific event.
 *
 *
 * eventId: string, username: string
 * Return boolean if the user is already enrolled in the event.
 *
 * @param request - The HTTP request object.
 * @returns A greeting message.
 */
export async function GET(request: Request) {

  const url = new URL(request.url);
  const eventId = url.searchParams.get("eventId");
  const username = url.searchParams.get("username");

  if (!eventId) {
    return new Response("Missing required fields", { status: 400 });
  }

  let data: Enrollment[] | Enrollment | null = null;
  let error: Error | null = null;
  let errorMessage: string | null = null;
  let errorStatusCode: number = 500;

  if (eventId && !username) {
    const result = await supabase
      .from("enrollments")
      .select("*")
      .eq("event_id", eventId);
    data = result.data;
    error = result.error;
    errorMessage = "Error fetching enrollments for event";
  } else if (eventId && username) {
    const result = await supabase
      .from("enrollments")
      .select("*")
      .eq("event_id", eventId)
      .eq("username", username)
      .single();
    data = result.data;
    error = result.error;
    errorMessage = "Player not enrolled in event";
    errorStatusCode = 404;
  } else {
    return new Response("Missing required fields", { status: 400 });
  }

  if (error) {
    console.error(errorMessage, error);
    return new Response("Error fetching enrollments", { status: errorStatusCode });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request: Request) {
  const { eventId, name } = await request.json();

  if (!eventId || !name) {
    return new Response("Missing required fields", { status: 400 });
  }

  const { data: existingUser, error: userError } = await supabase
    .from("enrollments")
    .select("username")
    .eq("username", name)
    .eq("event_id", eventId)
    .single();

  if (userError) {
    // Ignore error, no action needed.
  }

  if (existingUser) {
    return new Response(JSON.stringify({ message: "Player is already enrolled" }), { status: 400 });
  }


  const { data, error } = await supabase.from("enrollments").insert([
    { event_id: eventId, username: name },
  ]);


  if (error) {
    console.error("Error creating enrollment", error);
    return new Response("Error creating enrollment", { status: 500 });
  }

  return new Response(JSON.stringify(data), { status: 201 });
}
