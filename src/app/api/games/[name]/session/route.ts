import { supabase } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;

  const { data, error } = await supabase
    .from("game-sessions")
    .select("*")
    .ilike("name", name)

  if (error) {
    return new Response("Error fetching data", { status: 500 });
  }

  return new Response(JSON.stringify(data), { status: 200 });
}
