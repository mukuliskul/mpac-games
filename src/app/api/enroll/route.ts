import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId");

  if (!sessionId) {
    return new Response("Missing required fields", { status: 400 });
  }

  const { data, error } = await supabase
    .from("enrollments")
    .select("username")
    .eq("game_session_id", sessionId);

  if (error) {
    console.error("Error fetching enrollments", error);
    return new Response("Error fetching enrollments", { status: 500 });
  }

  console.log(data);

  return new Response(JSON.stringify(data), { status: 200 });
}

export async function POST(request: Request) {
  const { sessionId, name } = await request.json();

  if (!sessionId || !name) {
    return new Response("Missing required fields", { status: 400 });
  }

  const { data: existingUser, error: userError } = await supabase
    .from("enrollments")
    .select("username")
    .eq("username", name)
    .eq("game_session_id", sessionId)
    .single();

  if (userError) {
    // Ignore error, no action needed.
  }

  if (existingUser) {
    return new Response(JSON.stringify({ message: "Player is already enrolled" }), { status: 400 });
  }


  const { data, error } = await supabase.from("enrollments").insert([
    { game_session_id: sessionId, username: name },
  ]);


  if (error) {
    console.error("Error creating enrollment", error);
    return new Response("Error creating enrollment", { status: 500 });
  }

  return new Response(JSON.stringify(data), { status: 201 });
}
