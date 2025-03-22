"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { usernameAtom } from "@/state/usernameAtom";

const UsernameRedirector = () => {
  const [selectedUsername, setSelectedUsername] = useAtom(usernameAtom);
  const router = useRouter();

  useEffect(() => {
    if (selectedUsername) {
      return;
    }

    const storedUsername = localStorage.getItem("username");
    console.log("Stored username in localStorage:", storedUsername);

    if (!storedUsername) {
      router.push("/");
    } else {
      setSelectedUsername(storedUsername);
    }
  }, [selectedUsername, setSelectedUsername, router]);

  return null;
};

export default UsernameRedirector;
