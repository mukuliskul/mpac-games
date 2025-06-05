import { getAllRounds } from "@/lib/db";
import { BracketView } from "@/components/BracketView";

const EVENT_ID = "d6f8850b-4cc5-4d81-9711-9e7dccfa5796";

export default async function TournamentPage() {
  const rounds = await getAllRounds(EVENT_ID);

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mt-6">Tournament Bracket</h1>
      <BracketView rounds={rounds} />
    </div>
  );
}
