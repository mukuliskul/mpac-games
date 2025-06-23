import { getPublicHolidays } from "./utils";
import { getEnrolledPlayers, isPlayerBusyOnDate, insertGameSession, isEventBookedOnDate } from "./db";
import { Player } from "./types/interfaces";
import { DaysOfWeek } from "./types/enums";
import { DateTime } from "luxon";
import { getByePlayer } from "./db";
import { formatToNYDateString, parseNYDateString } from "./date";


export async function generateFirstRound(
  eventId: string,
  editionStartDate: string,
): Promise<{ message: string }> {
  const players = await getEnrolledPlayers(eventId);
  if (players.length < 2) throw new Error("Not enough players");

  // Fetch the real BYE player from the DB
  const byePlayer = await getByePlayer();

  const targetCount = Math.pow(2, Math.ceil(Math.log2(players.length)));
  while (players.length < targetCount) {
    players.push(byePlayer);
  }

  const shuffled = [...players].sort(() => Math.random() - 0.5);

  const editionStartDateObjConst = parseNYDateString(editionStartDate);
  let editionStartDateObj = editionStartDateObjConst;

  for (let i = 0; i < shuffled.length; i += 2) {
    const player1 = shuffled[i];
    const player2 = shuffled[i + 1];

    const isBye = (p: Player) => p.username === "BYE";

    const matchDate = isBye(player1) || isBye(player2)
      ? editionStartDateObjConst // If one player is BYE, use the original start date
      : await findNextAvailableDate(player1, player2, editionStartDate, eventId);

    await insertGameSession({
      eventId: eventId,
      round: 1,
      matchDate: formatToNYDateString(matchDate),
      player1: player1.username,
      player2: player2.username,
      winner: null,
    });

    editionStartDateObj = editionStartDateObj.plus({ days: 1 });
  }

  return { message: "First round generated" };
}

// Tries to find the next mutual day for match
export async function findNextAvailableDate(
  p1: Player,
  p2: Player,
  startDate: string,
  eventId: string,
): Promise<DateTime> {
  let dateObj = parseNYDateString(startDate);
  const holidays = await getPublicHolidays();

  while (true) {
    const dateStr = formatToNYDateString(dateObj);
    const day = dateObj.toFormat("EEEE") as DaysOfWeek;
    const isHoliday = holidays.has(dateStr);

    const bothAvailable = p1.days_in_office.includes(day) && p2.days_in_office.includes(day);
    const bothFree = !(await isPlayerBusyOnDate(p1.username, dateStr)) &&
      !(await isPlayerBusyOnDate(p2.username, dateStr));
    const eventFree = !(await isEventBookedOnDate(eventId, dateStr));

    if (bothAvailable && bothFree && eventFree && !isHoliday) {
      console.log("---------------------");
      console.log("Found available date:", dateStr);
      console.log("---------------------");
      return dateObj;
    }

    dateObj = dateObj.plus({ days: 1 });
  }
}
