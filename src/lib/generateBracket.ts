import { isHoliday } from "./utils";
import { getEnrolledPlayers, isPlayerBusyOnDate, insertGameSession } from "./db";
import { addDays, format } from "date-fns";
import { Match, Player } from "./types/interfaces";
import { DaysOfWeek } from "./types/enums";
import { formatInTimeZone } from "date-fns-tz";
import { DateTime } from "luxon";


export async function generateBracket(eventId: string, enrollmentEndDate: string) {
  const players = await getEnrolledPlayers(eventId);
  if (players.length < 2) throw new Error("Not enough players");

  // Step 1: Shuffle players
  const shuffled = [...players].sort(() => Math.random() - 0.5);

  // Step 2: Add byes if needed to reach power of 2
  const targetCount = Math.pow(2, Math.ceil(Math.log2(shuffled.length)));
  while (shuffled.length < targetCount) {
    shuffled.push({ ...shuffled[0], username: `BYE-${Date.now()}` }); // Placeholder
  }

  console.log("Shuffled players:", shuffled.map(p => p.username));


  // Step 3: Pair into rounds
  const rounds: Match[][] = [];
  rounds[0] = [];
  for (let i = 0; i < shuffled.length; i += 2) {
    rounds[0].push({
      player1: shuffled[i],
      player2: shuffled[i + 1],
      round: 1,
      date: null!,
    });
  }
  // Rounds [
  //   { player1: 'Mukul', player2: 'John' },
  //   { player1: 'Kevin', player2: 'BYE-1747185447092' }
  // ]

  // Step 4: Schedule rounds
  const localDate = DateTime.fromISO(enrollmentEndDate, { zone: 'America/New_York' });
  const enrollmentEndDateObj = localDate.toJSDate(); // native JavaScript Date object
  const publicHolidays = await isHoliday();

  console.log(enrollmentEndDateObj);

  for (let r = 0; r < rounds.length; r++) {
    for (const match of rounds[r]) {
      console.log("Scheduling match:", match.player1, "vs", match.player2);
      const matchDate = await findNextAvailableDate(
        match.player1,
        match.player2,
        enrollmentEndDateObj,
        publicHolidays,
        eventId
      );

      // match.date = matchDate;
      // await insertGameSession({
      //   eventId,
      //   round: match.round,
      //   matchDate,
      //   player1: match.player1.username,
      //   player2: match.player2.username,
      // });

      // Prep winner for next round
      // if (r + 1 >= rounds.length) rounds[r + 1] = [];

      // const placeholderPlayer = { ...match.player1, username: `WINNER_OF_${match.player1.username}_VS_${match.player2.username}` };
      // rounds[r + 1].push({ player1: placeholderPlayer, player2: null!, round: r + 2, date: null! });
    }

    // enrollmentEndDateObj = addDays(enrollmentEndDateObj, 1); // Step to next day for next round
  }

  /*   return { message: "Bracket generated" }; */
}

// TODO: dont export method below
// Tries to find the next mutual day for match
export async function findNextAvailableDate(
  p1: Player,
  p2: Player,
  startDate: Date,
  holidays: Set<string>,
  eventId: string
) {
  console.log("startDate", startDate);
  const date = startDate;

  while (true) {
    const day = format(date, "EEEE") as DaysOfWeek;
    const isHoliday = holidays.has(format(date, "yyyy-MM-dd"));

    console.log(day);
    console.log(isHoliday);
    // $$$$ WORKING TILL HERE

    return 1;

    // const bothAvailable = p1.days_in_office.includes(day) && p2.days_in_office.includes(day);
    // const bothFree = !(await isPlayerBusyOnDate(p1.username, date, eventId)) &&
    //   !(await isPlayerBusyOnDate(p2.username, date, eventId));
    //
    // if (bothAvailable && bothFree && !isHoliday) {
    //   return date;
    // }
    //
    // date = addDays(date, 1);
  }
}
