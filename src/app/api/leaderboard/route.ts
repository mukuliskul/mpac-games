import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const game = url.searchParams.get("game");

  if (game) {
    const formattedGame = game.replace(/-/g, " ");

    const { data: leaderboards, error } = await supabase
      .from("leaderboards")
      .select("username, total_wins:wins, last_updated:updated_at")
      .ilike("game_name", formattedGame)

    if (error) {
      console.error("Error fetching leaderboards:", error);
      return new Response("Error fetching data", { status: 500 });
    }

    return new Response(JSON.stringify(leaderboards), { status: 200 });
  }

  // Aggregate total wins for each unique username
  const { data: totalWins, error } = await supabase
    .from("leaderboards")
    .select("username, total_wins:wins.sum(), last_updated:updated_at.max()")

  console.log(totalWins);

  if (error) {
    console.error("Error fetching total wins:", error);
    return new Response("Error fetching data", { status: 500 });
  }

  return new Response(JSON.stringify(totalWins), { status: 200 });
}

export async function POST(
  request: Request,
) {
  const { username, game } = await request.json();

  let formattedGame = game.replace(/-/g, " ");
  formattedGame = formattedGame.charAt(0).toUpperCase() + formattedGame.slice(1);

  if (!username) {
    return new Response("Missing required fields", { status: 400 });
  }

  const { data: existingScore, error: userError } = await supabase
    .from("leaderboards")
    .select("*")
    .eq("game_name", formattedGame)
    .eq("username", username)
    .single();

  if (userError) {
    // Ignore error, no action needed.
  }

  if (existingScore) {
    const { data: updateScore, error: updateError } = await supabase
      .from("leaderboards")
      .update({ wins: existingScore.wins + 1 })
      .eq("game_name", formattedGame)
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
      { game_name: formattedGame, username: username, wins: 1 },
    ]);


  if (error) {
    console.error("Error creating leaderboard", error);
    return new Response("Error creating leaderboard", { status: 500 });
  }

  return new Response(JSON.stringify(newScore), { status: 200 });
}


