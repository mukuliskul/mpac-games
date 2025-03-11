import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const { sessionId, name } = await request.json();

  if (!sessionId || !name) {
    return new Response("Missing required fields", { status: 400 });
  }

  const { data: existingUser, error: userError } = await supabase
    .from("enrollments")
    .select("username")
    .eq("username", name)
    .single();

  if (userError) {
    // Ignore error, no action needed.
  }

  if (existingUser) {
    return new Response(JSON.stringify({ message: "Username already taken, please choose another." }), { status: 400 });
  }


  const { data, error } = await supabase.from("enrollments").insert([
    { game_session_id: sessionId, username: name },
  ]);


  if (error) {
    return new Response("Error creating enrollment", { status: 500 });
  }

  return new Response(JSON.stringify(data), { status: 201 });
}
