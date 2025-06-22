import { supabase } from "@/lib/supabase";

// TODO: add docstring to all methods
// TODO: use NextResponse instead of Response

// POST: Enroll user in event
export async function POST(request: Request) {
  const { eventId, name } = await request.json();

  if (!eventId || !name) {
    return new Response("Missing required fields", { status: 400 });
  }

  const { data: existingUser } = await supabase
    .from("enrollments")
    .select("username")
    .eq("username", name)
    .eq("event_id", eventId)
    .single();

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
