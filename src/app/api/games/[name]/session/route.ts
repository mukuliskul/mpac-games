import { supabase } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const formattedName = name.replace(/-/g, " ");

  const { data: game_sessions, error } = await supabase
    .from('game_sessions')
    .select("*")
    .ilike('game_name', formattedName)
    .order("start_time", { ascending: true });

  if (error) {
    return new Response("Error fetching data", { status: 500 });
  }

  return new Response(JSON.stringify(game_sessions), { status: 200 });
}
