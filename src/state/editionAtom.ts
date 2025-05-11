import { Edition } from "@/lib/types/interfaces";
import { atom } from "jotai";

export const currentEditionAtom = atom<string | null>(null);
export const enrollmentEndDateAtom = atom<string | null>(null);

const fetchConfigAtom = atom(async () => {
  const res = await fetch("/api/edition/active");
  if (!res.ok) throw new Error("Failed to fetch config");

  const active_edition: Edition = await res.json();

  return {
    currentEdition: active_edition.name,
    enrollmentEndDate: active_edition.start_date,
  };
});

export const loadConfigAtom = atom(
  null,
  async (get, set) => {
    try {
      const config = await get(fetchConfigAtom);
      set(currentEditionAtom, config.currentEdition);
      set(enrollmentEndDateAtom, config.enrollmentEndDate);
    } catch (error) {
      console.error("Failed to load config:", error);
    }
  }
);
