import { supabase } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;

  console.log(name);
  const formattedName = name.replace(/-/g, " ");

  const { data: leaderboards, error } = await supabase
    .from('leaderboards')
    .select("*")
    .ilike('game_name', formattedName)
    .order("wins", { ascending: false })
    .order("updated_at", { ascending: false });


  if (error) {
    console.log(error);
    return new Response("Error fetching data", { status: 500 });
  }

  return new Response(JSON.stringify(leaderboards), { status: 200 });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const { username } = await request.json();

  if (!username) {
    return new Response("Missing required fields", { status: 400 });
  }

  const { data: existingScore, error: userError } = await supabase
    .from("leaderboards")
    .select("*")
    .eq("game_name", name)
    .eq("username", username)
    .single();

  if (userError) {
    // Ignore error, no action needed.
  }

  if (existingScore) {
    const { data: updateScore, error: updateError } = await supabase
      .from("leaderboards")
      .update({ wins: existingScore.wins + 1 })
      .eq("game_name", name)
      .eq("username", username);

    if (updateError) {
      console.error("Error updating score", updateError);
      return new Response("Error updating score", { status: 500 });
    }

    return new Response(JSON.stringify(updateScore), { status: 200 });
  }


  const { data: newScore, error } = await supabase
    .from("leaderboards")
    .insert([
      { game_name: name, username: name, wins: 1 },
    ]);


  if (error) {
    console.error("Error creating leaderboard", error);
    return new Response("Error creating leaderboard", { status: 500 });
  }

  return new Response(JSON.stringify(newScore), { status: 200 });
}

