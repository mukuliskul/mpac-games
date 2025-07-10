import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const gameName = url.searchParams.get("gameName");
  const edition = url.searchParams.get("edition");

  if (!gameName) {
    return new Response("Missing required fields", { status: 400 });
  }
  const formattedName = gameName.replace(/-/g, " ");

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .ilike("game_name", formattedName)
    .eq("edition", edition)
    .single();

  if (error) {
    console.error("Error fetching event", error);
    return new Response("Error fetching event", { status: 500 });
  }

  return new Response(JSON.stringify(data), { status: 200 });
}

