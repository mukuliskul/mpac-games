"use client";

import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { loadConfigAtom } from "@/state/editionAtom";

export default function AppInitializer() {
  const loadConfig = useSetAtom(loadConfigAtom);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return null;
}
