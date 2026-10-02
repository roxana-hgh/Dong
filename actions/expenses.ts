"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { authorizeGroupMember } from "@/lib/session";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { parseMoneyToMinor } from "@/lib/money";
import { resolveSplitFromForm } from "@/lib/splits";
import { deleteExpenseSchema, expenseSchema } from "@/validators/expense";

export async function createExpense(input: unknown): Promise<ActionResult<{ expenseId: string }>> {
  // groupId lives inside the payload, so: validate shape -> authenticate + authorize -> mutate
  const parsed = expenseSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  const data = parsed.data;

  const access = await authorizeGroupMember(data.groupId);
  if (!access.ok) return fail(access.error);

  // Never trust client-supplied ids: every referenced member must belong to THIS group.
  const groupMembers = await db.groupMember.findMany({ where: { groupId: data.groupId }, select: { id: true } });
  const validIds = new Set(groupMembers.map((m) => m.id));
  const included = data.participants.filter((p) => p.included);
  if (!validIds.has(data.paidById) || included.some((p) => !validIds.has(p.memberId))) {
    return fail("Invalid member selected");
  }

  const amountMinor = parseMoneyToMinor(data.amount);
  if (amountMinor === null || amountMinor <= 0) return fail("Invalid amount");

  const split = resolveSplitFromForm(amountMinor, data.splitType, data.participants);
  if (!split.ok) return fail(split.error);

  const expense = await db.$transaction(async (tx) => {
    const created = await tx.expense.create({
      data: {
        groupId: data.groupId,
        title: data.title,
        amountMinor,
        category: data.category,
        date: new Date(`${data.date}T00:00:00.000Z`),
        splitType: data.splitType,
        note: data.note || null,
        paidById: data.paidById,
        createdById: access.member.id,
        shares: { create: split.shares }, // resolved shares are the source of truth
      },
      select: { id: true },
    });

    await tx.activity.create({
      data: {
        groupId: data.groupId,
        actorId: access.member.id,
        type: "EXPENSE_ADDED",
        metadata: { expenseId: created.id, title: data.title, amountMinor },
      },
    });
    return created;
  });

  revalidatePath(`/groups/${data.groupId}`, "layout");
  revalidatePath("/");
  return ok({ expenseId: expense.id });
}

export async function deleteExpense(input: unknown): Promise<ActionResult<null>> {
  const parsed = deleteExpenseSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid input");
  const { groupId, expenseId } = parsed.data;

  const access = await authorizeGroupMember(groupId);
  if (!access.ok) return fail(access.error);

  const expense = await db.expense.findFirst({
    where: { id: expenseId, groupId },
    select: { id: true, title: true, createdById: true },
  });
  if (!expense) return fail("Expense not found");

  const canDelete = access.member.role === "OWNER" || expense.createdById === access.member.id;
  if (!canDelete) return fail("You can only delete your own expenses");

  await db.$transaction([
    db.expense.delete({ where: { id: expenseId } }), // shares are removed by onDelete: Cascade
    db.activity.create({
      data: { groupId, actorId: access.member.id, type: "EXPENSE_DELETED", metadata: { title: expense.title } },
    }),
  ]);

  revalidatePath(`/groups/${groupId}`, "layout");
  revalidatePath("/");
  return ok(null);
}