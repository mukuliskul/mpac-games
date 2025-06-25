"use client";

import { usePathname } from "next/navigation";
import SupportWidget from "@/components/SupportWidget";

export default function SupportWidgetWrapper() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  return <SupportWidget />;
}


