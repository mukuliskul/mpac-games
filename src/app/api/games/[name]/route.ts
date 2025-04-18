import { supabase } from "@/lib/supabase";

/**
 * GET /api/games/[name]
 *
 * name: string
 * Retrieves a game by its name.
*/

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const formattedName = name.replace(/-/g, " ");

  const { data, error, count } = await supabase
    .from("games")
    .select("*", { count: "exact" })
    .ilike("name", formattedName)
    .limit(1);

  if (error) {
    return new Response("Error fetching data", { status: 500 });
  }

  if (count === 0) {
    // If no data is found
    return new Response("Game not found.", { status: 404 });
  }

  return new Response(JSON.stringify(data[0]), { status: 200 });
}
