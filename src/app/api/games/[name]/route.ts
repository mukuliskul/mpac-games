import { supabase } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .ilike("name", name)
    .single();

  if (error) {
    console.log(error)
    return new Response("Error fetching data", { status: 500 });
  }

  if (!data) {
    return new Response("Game not found.", { status: 404 })
  }


  return new Response(JSON.stringify(data), { status: 200 });
}

