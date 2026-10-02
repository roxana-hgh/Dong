"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { authorizeGroupMember } from "@/lib/session";
import { loadGroupFinancials } from "@/lib/group-financials";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { markPaidSchema, undoSettlementSchema } from "@/validators/settlement";

function isSerializationFailure(e: unknown): boolean {
  return typeof e === "object" && e !== null && "code" in e && (e as { code: unknown }).code === "P2034";
}

export async function markSettlementPaid(input: unknown): Promise<ActionResult<null>> {
  const parsed = markPaidSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid input");
  const { groupId, fromMemberId, toMemberId, amountMinor } = parsed.data;

  const access = await authorizeGroupMember(groupId);
  if (!access.ok) return fail(access.error);
  const { member } = access;

  const involved = member.id === fromMemberId || member.id === toMemberId;
  if (!involved && member.role !== "OWNER") {
    return fail("Only the people involved or the group owner can mark this as paid");
  }

  try {
    const outcome = await db.$transaction(
      async (tx) => {
        // Never trust the client's amount: recompute and require an exact match with a real pending transfer.
        const { transfers } = await loadGroupFinancials(groupId, tx);
        const matches = transfers.some(
          (t) => t.fromMemberId === fromMemberId && t.toMemberId === toMemberId && t.amountMinor === amountMinor,
        );
        if (!matches) return "STALE" as const;

        await tx.settlement.create({
          data: { groupId, fromMemberId, toMemberId, amountMinor, markedById: member.id },
        });
        await tx.activity.create({
          data: {
            groupId,
            actorId: member.id,
            type: "SETTLEMENT_PAID",
            metadata: { fromMemberId, toMemberId, amountMinor },
          },
        });
        return "OK" as const;
      },
      { isolationLevel: "Serializable" },
    );

    if (outcome === "STALE") return fail("This payment is out of date. Refresh the page.");
  } catch (e) {
    if (isSerializationFailure(e)) return fail("Someone else just updated this group. Please try again.");
    throw e;
  }

  revalidatePath(`/groups/${groupId}`, "layout");
  revalidatePath("/");
  return ok(null);
}

export async function undoSettlement(input: unknown): Promise<ActionResult<null>> {
  const parsed = undoSettlementSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid input");
  const { groupId, settlementId } = parsed.data;

  const access = await authorizeGroupMember(groupId);
  if (!access.ok) return fail(access.error);
  const { member } = access;

  const settlement = await db.settlement.findFirst({
    where: { id: settlementId, groupId },
    select: { markedById: true, fromMemberId: true, toMemberId: true, amountMinor: true },
  });
  if (!settlement) return fail("Payment not found");
  if (member.role !== "OWNER" && settlement.markedById !== member.id) {
    return fail("Only the person who marked it or the group owner can undo this");
  }

  await db.$transaction([
    db.settlement.delete({ where: { id: settlementId } }),
    db.activity.create({
      data: {
        groupId,
        actorId: member.id,
        type: "SETTLEMENT_UNDONE",
        metadata: {
          fromMemberId: settlement.fromMemberId,
          toMemberId: settlement.toMemberId,
          amountMinor: settlement.amountMinor,
        },
      },
    }),
  ]);

  revalidatePath(`/groups/${groupId}`, "layout");
  revalidatePath("/");
  return ok(null);
}