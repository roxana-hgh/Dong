"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { authorizeGroupMember, getCurrentUser, getMembership } from "@/lib/session";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import {
  addMemberSchema,
  createGroupSchema,
  joinGroupSchema,
  removeMemberSchema,
} from "@/validators/group";

const newInviteToken = () => randomBytes(16).toString("base64url");

export async function createGroup(input: unknown): Promise<ActionResult<{ groupId: string }>> {
  const user = await getCurrentUser(); // 1. authenticate (guests have a session too)
  if (!user) return fail("Not authenticated");

  const parsed = createGroupSchema.safeParse(input); // 3. validate
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  const { name, yourName, members } = parsed.data;

  // 4. One interactive transaction: group + members + activity succeed or fail together.
  const group = await db.$transaction(async (tx) => {
    const created = await tx.group.create({
      data: {
        name,
        createdById: user.id,
        inviteToken: newInviteToken(),
        members: {
          create: [
            { userId: user.id, displayName: yourName, role: "OWNER" },
            ...members.map((m) => ({ displayName: m.name })), // placeholders (no account yet)
          ],
        },
      },
      select: { id: true, members: { select: { id: true, userId: true } } },
    });

    await tx.activity.create({
      data: {
        groupId: created.id,
        actorId: created.members.find((m) => m.userId === user.id)?.id,
        type: "GROUP_CREATED",
        metadata: { name },
      },
    });
    return created;
  });

  revalidatePath("/");
  return ok({ groupId: group.id });
}

export async function addMember(input: unknown): Promise<ActionResult<null>> {
  const parsed = addMemberSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  const { groupId, name } = parsed.data;

  const access = await authorizeGroupMember(groupId); // authenticate + authorize
  if (!access.ok) return fail(access.error);

  const existing = await db.groupMember.findMany({ where: { groupId }, select: { displayName: true } });
  if (existing.some((m) => m.displayName.toLowerCase() === name.toLowerCase())) {
    return fail("Someone with this name is already in the group");
  }
  if (existing.length >= 50) return fail("Group member limit reached");

  await db.$transaction([
    db.groupMember.create({ data: { groupId, displayName: name } }),
    db.activity.create({
      data: { groupId, actorId: access.member.id, type: "MEMBER_ADDED", metadata: { name } },
    }),
  ]);

  revalidatePath(`/groups/${groupId}`, "layout");
  return ok(null);
}

export async function removeMember(input: unknown): Promise<ActionResult<null>> {
  const parsed = removeMemberSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid input");
  const { groupId, memberId } = parsed.data;

  const access = await authorizeGroupMember(groupId);
  if (!access.ok) return fail(access.error);
  if (access.member.role !== "OWNER") return fail("Only the group owner can remove members");

  const target = await db.groupMember.findFirst({
    where: { id: memberId, groupId }, // groupId in the filter: never trust a client-supplied id alone
    select: {
      displayName: true,
      role: true,
      _count: { select: { paidExpenses: true, shares: true } },
    },
  });
  if (!target) return fail("Member not found");
  if (target.role === "OWNER") return fail("The owner cannot be removed");
  if (target._count.paidExpenses > 0 || target._count.shares > 0) {
    return fail("This member is part of existing expenses and can't be removed");
  }

  await db.$transaction([
    db.groupMember.delete({ where: { id: memberId } }),
    db.activity.create({
      data: { groupId, actorId: access.member.id, type: "MEMBER_REMOVED", metadata: { name: target.displayName } },
    }),
  ]);

  revalidatePath(`/groups/${groupId}`, "layout");
  return ok(null);
}

export async function regenerateInviteToken(groupId: string): Promise<ActionResult<null>> {
  const access = await authorizeGroupMember(groupId);
  if (!access.ok) return fail(access.error);
  if (access.member.role !== "OWNER") return fail("Only the group owner can regenerate the link");

  await db.group.update({ where: { id: groupId }, data: { inviteToken: newInviteToken() } });
  revalidatePath(`/groups/${groupId}/members`);
  return ok(null);
}

/** Join via invite link: either claim an existing placeholder ("I'm Sara") or join as a new member. */
export async function joinGroup(input: unknown): Promise<ActionResult<{ groupId: string }>> {
  const user = await getCurrentUser();
  if (!user) return fail("Not authenticated");

  const parsed = joinGroupSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  const { token, displayName, claimMemberId } = parsed.data;

  const group = await db.group.findUnique({
    where: { inviteToken: token },
    select: { id: true, status: true },
  });
  if (!group || group.status !== "ACTIVE") return fail("This invite link is invalid or expired");

  if (await getMembership(group.id, user.id)) return ok({ groupId: group.id }); // idempotent

  try {
    await db.$transaction(async (tx) => {
      let memberId: string;
      let name: string;

      if (claimMemberId) {
        // `userId: null` in the filter makes the claim atomic: two people can't claim the same placeholder.
        const claimed = await tx.groupMember.updateMany({
          where: { id: claimMemberId, groupId: group.id, userId: null },
          data: { userId: user.id },
        });
        if (claimed.count === 0) throw new Error("CLAIM_TAKEN");
        const m = await tx.groupMember.findUniqueOrThrow({
          where: { id: claimMemberId },
          select: { id: true, displayName: true },
        });
        memberId = m.id;
        name = m.displayName;
      } else {
        name = displayName ?? "Guest";
        const m = await tx.groupMember.create({
          data: { groupId: group.id, userId: user.id, displayName: name },
          select: { id: true },
        });
        memberId = m.id;
      }

      await tx.activity.create({
        data: { groupId: group.id, actorId: memberId, type: "MEMBER_JOINED", metadata: { name } },
      });
    });
  } catch (e) {
    if (e instanceof Error && e.message === "CLAIM_TAKEN") return fail("That person has already been claimed");
    throw e;
  }

  revalidatePath("/");
  
  return ok({ groupId: group.id });
}