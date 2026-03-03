"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
//when the user go to the chat,these hooks will run for to give the user info to the Convex,like setting its status online 
//hmm,i will be using this in the layout for the caht
export function useSyncUser() {
  const { user, isLoaded } = useUser();
  const upsertUser = useMutation(api.users.upsertUser);

  useEffect(() => {
    if (!user || !isLoaded) return;

    upsertUser({
      clerkId: user.id,
      name: user.fullName ?? user.username ?? "Unknown",
      email: user.primaryEmailAddress?.emailAddress ?? "",
      imageUrl: user.imageUrl,
    });
  }, [user, isLoaded, upsertUser]);
}