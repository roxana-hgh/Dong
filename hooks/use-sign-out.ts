"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function useSignOut() {
  const router = useRouter();

  return async function signOut() {
    // Better Auth deletes the session row and clears the cookie
    const { error } = await authClient.signOut();
    if (error) return; // keep the user on the page if it failed

    router.push("/");
    // Re-runs the server layout so getSessionUser() returns null
    router.refresh();
  };
}