import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

// cache() dedupes the call inside a single request, so the layout and
// pages can both call it without hitting the database twice
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null; // guest

  // Return only the fields the UI needs, never the whole session object:
  // these props get serialized and sent to Client Components
  const { id, name, email, image } = session.user;
  return { id, name, email, image: image ?? null };
});