import { supabase } from "@/lib/supabase";

/**
 * GET /api/edition/active
 *
 * Retrieves active edition
 */
export async function GET() {
  const { data, error } = await supabase
    .from("edition")
    .select("*")
    .eq("is_active", "True")
    .single();

  if (error) {
    console.error("Error fetching edition", error);
    return new Response("Error fetching edition", { status: 500 });
  }

  return new Response(JSON.stringify(data), { status: 200 });
}

