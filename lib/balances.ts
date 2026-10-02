export type BalanceExpense = {
  paidById: string;
  amountMinor: number;
  shares: { memberId: string; shareMinor: number }[];
};
export type BalanceSettlement = { fromMemberId: string; toMemberId: string; amountMinor: number };

export type MemberBalance = {
  memberId: string;
  paidMinor: number; // total this member paid for expenses
  shareMinor: number; // total this member owes for expenses
  sentMinor: number; // money this member already paid to settle debts
  receivedMinor: number; // money this member already received
  balanceMinor: number; // >0 is owed money, <0 owes money
};

type BalanceParts = Pick<MemberBalance, "paidMinor" | "shareMinor" | "sentMinor" | "receivedMinor">;

/** Single source of truth for the formula (also used by SQL-aggregate callers). */
export function netBalance(p: BalanceParts): number {
  return p.paidMinor - p.shareMinor + p.sentMinor - p.receivedMinor;
}

export function computeBalances(
  memberIds: string[],
  expenses: BalanceExpense[],
  settlements: BalanceSettlement[],
): MemberBalance[] {
  const rows = new Map<string, BalanceParts & { memberId: string }>(
    memberIds.map((memberId) => [
      memberId,
      { memberId, paidMinor: 0, shareMinor: 0, sentMinor: 0, receivedMinor: 0 },
    ]),
  );
  const get = (id: string) => {
    const row = rows.get(id);
    if (!row) throw new Error(`Unknown member: ${id}`);
    return row;
  };

  for (const e of expenses) {
    get(e.paidById).paidMinor += e.amountMinor;
    for (const s of e.shares) get(s.memberId).shareMinor += s.shareMinor;
  }
  for (const s of settlements) {
    get(s.fromMemberId).sentMinor += s.amountMinor;
    get(s.toMemberId).receivedMinor += s.amountMinor;
  }

  const result = [...rows.values()].map((r) => ({ ...r, balanceMinor: netBalance(r) }));
  if (result.reduce((sum, r) => sum + r.balanceMinor, 0) !== 0) {
    throw new Error("Invariant violated: balances do not sum to zero");
  }
  return result;
}