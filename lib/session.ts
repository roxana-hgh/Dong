import { cache } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/** Current user (guests included) or null. Deduped per request via React cache. */
export const getCurrentUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
});

/** Membership of a user in a group, or null. */
export const getMembership = cache(async (groupId: string, userId: string) =>
  db.groupMember.findFirst({
    where: { groupId, userId },
    select: { id: true, role: true, displayName: true },
  }),
);

/**
 * For Server Actions: authenticate + authorize membership.
 * Returns a result instead of throwing (expected errors are not exceptions).
 */
export async function authorizeGroupMember(groupId: string) {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: "Not authenticated" };

  const member = await getMembership(groupId, user.id);
  if (!member) return { ok: false as const, error: "You are not a member of this group" };

  return { ok: true as const, user, member };
}

/** For pages/layouts: same check, but responds with a 404 (does not leak that the group exists). */
export async function requireGroupMember(groupId: string) {
  const user = await getCurrentUser();
  if (!user) notFound();

  const member = await getMembership(groupId, user.id);
  if (!member) notFound();

  return { user, member };
}

export type SessionUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;