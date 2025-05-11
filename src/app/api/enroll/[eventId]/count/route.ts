import { supabase } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;

  const result = await supabase
    .from("enrollments")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId);

  if (result.error) {
    console.error("Error fetching count of enrollments", result.error);
    return new Response("Error fetching count", { status: 500 });
  }

  return new Response(JSON.stringify({ count: result.count ?? 0 }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
