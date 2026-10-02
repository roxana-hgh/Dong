import { cache } from "react";
import { db } from "@/lib/db";
import { computeBalances, netBalance } from "@/lib/balances";
import { simplifyDebts } from "@/lib/settlements";

// Works with both `db` and a transaction client (`tx`).
type Db = Pick<typeof db, "groupMember" | "expense" | "settlement">;

export async function loadGroupFinancials(groupId: string, client: Db = db) {
  const [members, expenses, settlements] = await Promise.all([
    client.groupMember.findMany({
      where: { groupId },
      orderBy: { joinedAt: "asc" },
      select: { id: true, displayName: true, role: true, userId: true },
    }),
    client.expense.findMany({
      where: { groupId },
      select: {
        paidById: true,
        amountMinor: true,
        shares: { select: { memberId: true, shareMinor: true } },
      },
    }),
    client.settlement.findMany({
      where: { groupId },
      orderBy: { paidAt: "desc" },
      select: { id: true, fromMemberId: true, toMemberId: true, amountMinor: true, markedById: true, paidAt: true },
    }),
  ]);

  const balances = computeBalances(members.map((m) => m.id), expenses, settlements);
  const transfers = simplifyDebts(balances); // what is STILL needed
  const totalMinor = expenses.reduce((sum, e) => sum + e.amountMinor, 0);

  return { members, balances, transfers, settlements, totalMinor };
}

/** Deduped per request: layout + page can both call it without extra queries. */
export const getGroupFinancials = cache((groupId: string) => loadGroupFinancials(groupId));

/**
 * Home page: balance of the current user in EVERY group with 5 aggregate queries total
 * (instead of loading all expenses of all groups into memory).
 */
export async function getGroupsSummary(userId: string) {
  const memberships = await db.groupMember.findMany({
    where: { userId, group: { status: "ACTIVE" } },
    orderBy: { group: { createdAt: "desc" } },
    select: {
      id: true,
      group: { select: { id: true, name: true, _count: { select: { members: true } } } },
    },
  });
  const myMemberIds = memberships.map((m) => m.id);
  const groupIds = memberships.map((m) => m.group.id);

  const [totals, paid, shares, sent, received] = await Promise.all([
    db.expense.groupBy({ by: ["groupId"], where: { groupId: { in: groupIds } }, _sum: { amountMinor: true } }),
    db.expense.groupBy({ by: ["paidById"], where: { paidById: { in: myMemberIds } }, _sum: { amountMinor: true } }),
    db.expenseShare.groupBy({ by: ["memberId"], where: { memberId: { in: myMemberIds } }, _sum: { shareMinor: true } }),
    db.settlement.groupBy({ by: ["fromMemberId"], where: { fromMemberId: { in: myMemberIds } }, _sum: { amountMinor: true } }),
    db.settlement.groupBy({ by: ["toMemberId"], where: { toMemberId: { in: myMemberIds } }, _sum: { amountMinor: true } }),
  ]);

  const totalByGroup = new Map(totals.map((r) => [r.groupId, r._sum.amountMinor ?? 0]));
  const paidBy = new Map(paid.map((r) => [r.paidById, r._sum.amountMinor ?? 0]));
  const shareBy = new Map(shares.map((r) => [r.memberId, r._sum.shareMinor ?? 0]));
  const sentBy = new Map(sent.map((r) => [r.fromMemberId, r._sum.amountMinor ?? 0]));
  const receivedBy = new Map(received.map((r) => [r.toMemberId, r._sum.amountMinor ?? 0]));

  return memberships.map((m) => ({
    id: m.group.id,
    name: m.group.name,
    memberCount: m.group._count.members,
    totalMinor: totalByGroup.get(m.group.id) ?? 0,
    balanceMinor: netBalance({
      paidMinor: paidBy.get(m.id) ?? 0,
      shareMinor: shareBy.get(m.id) ?? 0,
      sentMinor: sentBy.get(m.id) ?? 0,
      receivedMinor: receivedBy.get(m.id) ?? 0,
    }),
  }));
}