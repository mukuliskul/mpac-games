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

