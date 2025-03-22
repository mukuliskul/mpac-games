import { atom } from "jotai";

// Create an atom to store the selected player's username
export const usernameAtom = atom<string | null>(null);

