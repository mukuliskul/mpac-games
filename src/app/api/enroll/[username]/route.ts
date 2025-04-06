import { supabase } from "@/lib/supabase";
// TODO: make an [id] endpoint which will hten have username or be inside [id]

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const url = new URL(request.url);
  const eventId = url.searchParams.get("eventId");

  if (!eventId) {
    return new Response("Missing required fields", { status: 400 });
  }

  const { data, error } = await supabase
    .from("enrollments")
    .select("username")
    .eq("event_id", eventId);

  if (error) {
    console.error("Error fetching enrollments", error);
    return new Response("Error fetching enrollments", { status: 500 });
  }

  return new Response(JSON.stringify(data), { status: 200 });
}

