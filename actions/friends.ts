// actions/friends.ts
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { authorizeGroupMember, getCurrentUser } from "@/lib/session";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import {
  addFriendSchema,
  addFriendsToGroupSchema,
  deleteFriendListSchema,
  friendListSchema,
  removeFriendSchema,
  saveMembersAsFriendsSchema,
  setFriendListsSchema,
} from "@/validators/friend";

const FRIEND_LIMIT = 200;
const GROUP_MEMBER_LIMIT = 50; // same limit as addMember
const keyOf = (name: string) => name.trim().toLowerCase();

/** Friends belong to registered users only; guests (anonymous sessions) don't get an address book. */
async function authenticateRegistered() {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: "Not authenticated" };
  if (user.isAnonymous) return { ok: false as const, error: "Sign in to use Friends" };
  return { ok: true as const, user };
}

// Prisma's unique-constraint error code, checked without importing the generated client.
const isUniqueViolation = (e: unknown) =>
  typeof e === "object" && e !== null && "code" in e && (e as { code: unknown }).code === "P2002";

/** Every list id coming from the client must belong to the current user (prevents IDOR). */
async function ownsAllLists(ownerId: string, listIds: string[]) {
  const unique = new Set(listIds);
  if (unique.size === 0) return true;
  const count = await db.friendList.count({ where: { ownerId, id: { in: [...unique] } } });
  return count === unique.size;
}

export async function addFriend(input: unknown): Promise<ActionResult<{ friendId: string }>> {
  const auth = await authenticateRegistered();
  if (!auth.ok) return fail(auth.error);

  const parsed = addFriendSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  const { name, listIds } = parsed.data;
  const ownerId = auth.user.id;

  if (!(await ownsAllLists(ownerId, listIds))) return fail("List not found");
  if ((await db.friend.count({ where: { ownerId } })) >= FRIEND_LIMIT) return fail("Friend limit reached");

  try {
    const friend = await db.friend.create({
      data: { ownerId, name, nameKey: keyOf(name), lists: { connect: listIds.map((id) => ({ id })) } },
      select: { id: true },
    });
    revalidatePath("/friends");
    return ok({ friendId: friend.id });
  } catch (e) {
    if (isUniqueViolation(e)) return fail("You already have a friend with this name");
    throw e;
  }
}

export async function removeFriend(input: unknown): Promise<ActionResult<null>> {
  const auth = await authenticateRegistered();
  if (!auth.ok) return fail(auth.error);
  const parsed = removeFriendSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid input");

  // ownerId in the filter: a user can only ever delete their own friends.
  const { count } = await db.friend.deleteMany({
    where: { id: parsed.data.friendId, ownerId: auth.user.id },
  });
  if (count === 0) return fail("Friend not found");

  revalidatePath("/friends");
  return ok(null);
}

export async function createFriendList(input: unknown): Promise<ActionResult<{ listId: string }>> {
  const auth = await authenticateRegistered();
  if (!auth.ok) return fail(auth.error);
  const parsed = friendListSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input");

  const ownerId = auth.user.id;
  if ((await db.friendList.count({ where: { ownerId } })) >= 20) return fail("List limit reached");

  try {
    const list = await db.friendList.create({
      data: { ownerId, name: parsed.data.name, nameKey: keyOf(parsed.data.name) },
      select: { id: true },
    });
    revalidatePath("/friends");
    return ok({ listId: list.id });
  } catch (e) {
    if (isUniqueViolation(e)) return fail("You already have a list with this name");
    throw e;
  }
}

export async function deleteFriendList(input: unknown): Promise<ActionResult<null>> {
  const auth = await authenticateRegistered();
  if (!auth.ok) return fail(auth.error);
  const parsed = deleteFriendListSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid input");

  // Deleting a list never deletes the friends in it, only the links (join rows cascade).
  const { count } = await db.friendList.deleteMany({
    where: { id: parsed.data.listId, ownerId: auth.user.id },
  });
  if (count === 0) return fail("List not found");

  revalidatePath("/friends");
  return ok(null);
}

/** Replace the full set of lists a friend belongs to. */
export async function setFriendLists(input: unknown): Promise<ActionResult<null>> {
  const auth = await authenticateRegistered();
  if (!auth.ok) return fail(auth.error);
  const parsed = setFriendListsSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid input");
  const { friendId, listIds } = parsed.data;
  const ownerId = auth.user.id;

  const friend = await db.friend.findFirst({ where: { id: friendId, ownerId }, select: { id: true } });
  if (!friend) return fail("Friend not found");
  if (!(await ownsAllLists(ownerId, listIds))) return fail("List not found");

  await db.friend.update({
    where: { id: friendId },
    data: { lists: { set: listIds.map((id) => ({ id })) } }, // `set` = replace the whole relation
  });

  revalidatePath("/friends");
  return ok(null);
}

/** "Save to friends" from a group's member list. Already-saved names are skipped silently. */
export async function saveMembersAsFriends(input: unknown): Promise<ActionResult<{ added: number }>> {
  const auth = await authenticateRegistered();
  if (!auth.ok) return fail(auth.error);
  const parsed = saveMembersAsFriendsSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid input");
  const { groupId, memberIds } = parsed.data;
  const ownerId = auth.user.id;

  const access = await authorizeGroupMember(groupId);
  if (!access.ok) return fail(access.error);

  const members = await db.groupMember.findMany({
    where: { groupId, id: { in: memberIds } }, // groupId in the filter again
    select: { displayName: true, userId: true },
  });
  const toSave = members.filter((m) => m.userId !== ownerId); // don't save yourself

  if ((await db.friend.count({ where: { ownerId } })) + toSave.length > FRIEND_LIMIT) {
    return fail("Friend limit reached");
  }

  // skipDuplicates → INSERT ... ON CONFLICT DO NOTHING, so the unique index does the dedupe for us.
  const result = await db.friend.createMany({
    data: toSave.map((m) => ({ ownerId, name: m.displayName, nameKey: keyOf(m.displayName) })),
    skipDuplicates: true,
  });

  revalidatePath("/friends");
  revalidatePath(`/groups/${groupId}/members`);
  return ok({ added: result.count });
}

/** Add several friends to a group at once (names are copied, see the design notes). */
export async function addFriendsToGroup(
  input: unknown,
): Promise<ActionResult<{ added: number; skipped: number }>> {
  const auth = await authenticateRegistered();
  if (!auth.ok) return fail(auth.error);
  const parsed = addFriendsToGroupSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid input");
  const { groupId, friendIds } = parsed.data;

  const access = await authorizeGroupMember(groupId);
  if (!access.ok) return fail(access.error);

  const friends = await db.friend.findMany({
    where: { ownerId: auth.user.id, id: { in: friendIds } }, // only my own friends
    select: { name: true },
  });
  if (friends.length === 0) return fail("Friends not found");

  const existing = await db.groupMember.findMany({ where: { groupId }, select: { displayName: true } });
  const taken = new Set(existing.map((m) => keyOf(m.displayName)));
  const toAdd = friends.filter((f) => !taken.has(keyOf(f.name)));

  if (toAdd.length === 0) return ok({ added: 0, skipped: friends.length });
  if (existing.length + toAdd.length > GROUP_MEMBER_LIMIT) return fail("Group member limit reached");

  // Array-style transaction: both statements are known upfront, so no interactive tx needed.
  await db.$transaction([
    db.groupMember.createMany({ data: toAdd.map((f) => ({ groupId, displayName: f.name })) }),
    db.activity.create({
      data: {
        groupId,
        actorId: access.member.id,
        type: "MEMBERS_ADDED",
        metadata: { names: toAdd.map((f) => f.name) },
      },
    }),
  ]);

  revalidatePath(`/groups/${groupId}`, "layout");
  return ok({ added: toAdd.length, skipped: friends.length - toAdd.length });
}