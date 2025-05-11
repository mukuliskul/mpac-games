import { supabase } from "@/lib/supabase";
import { Enrollment } from "@/lib/types/interfaces";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string, username: string }> }
) {
  const { eventId, username } = await params;

  const result = await supabase
    .from("enrollments")
    .select("*")
    .eq("event_id", eventId)
    .eq("username", username)
    .single() as { data: Enrollment | null; error: Error | null };

  if (result.error || !result.data) {
    console.error("Player not enrolled in event", result.error);
    return new Response("Player not enrolled in event", { status: 404 });
  }

  return new Response(JSON.stringify(result.data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
