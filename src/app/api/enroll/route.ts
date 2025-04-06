import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const eventId = url.searchParams.get("eventId");

  if (!eventId) {
    return new Response("Missing required fields", { status: 400 });
  }

  const { data, error } = await supabase
    .from("enrollments")
    .select("username")
    .eq("event_id", eventId);

  if (error) {
    console.error("Error fetching enrollments", error);
    return new Response("Error fetching enrollments", { status: 500 });
  }

  return new Response(JSON.stringify(data), { status: 200 });
}

export async function POST(request: Request) {
  const { eventId, name } = await request.json();

  if (!eventId || !name) {
    return new Response("Missing required fields", { status: 400 });
  }

  console.log(eventId);
  console.log(name);

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
