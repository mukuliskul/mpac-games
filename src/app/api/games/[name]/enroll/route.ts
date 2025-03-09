import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase.from("enrollments").select("*");

  if (error) {
    return new Response("Error fetching data", { status: 500 });
  }

  return new Response(JSON.stringify(data), { status: 200 });
}
