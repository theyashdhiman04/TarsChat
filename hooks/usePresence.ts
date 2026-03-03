"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function usePresence() {
  const { user } = useUser();
  const setPresence = useMutation(api.users.setPresence);

  useEffect(() => {
    if (!user) return;

    setPresence({ isOnline: true });

    const handleVisibilityChange = () => {
      setPresence({ isOnline: !document.hidden });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    const interval = setInterval(() => {
      if (!document.hidden) {
        setPresence({ isOnline: true });
      }
    }, 30000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
      setPresence({ isOnline: false });
    };
  }, [user, setPresence]);
}