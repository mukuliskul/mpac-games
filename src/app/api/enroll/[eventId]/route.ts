import { supabase } from "@/lib/supabase";
import { Enrollment } from "@/lib/types/interfaces";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;

  const { data, error } = await supabase
    .from("enrollments")
    .select("*")
    .eq("event_id", eventId) as { data: Enrollment[] | null; error: Error | null };

  if (error) {
    console.error("Error fetching enrollments", error);
    return new Response("Error fetching enrollments", { status: 500 });
  }

  return new Response(JSON.stringify(data ?? []), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
