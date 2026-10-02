export type Transfer = { fromMemberId: string; toMemberId: string; amountMinor: number };

type Entry = { id: string; amount: number };
const compare = (a: Entry, b: Entry) =>
  b.amount - a.amount || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0); // largest first, then stable by id

/** Greedy: repeatedly match the largest debtor with the largest creditor. */
export function simplifyDebts(balances: { memberId: string; balanceMinor: number }[]): Transfer[] {
  if (balances.reduce((s, b) => s + b.balanceMinor, 0) !== 0) {
    throw new Error("Cannot simplify: balances do not sum to zero");
  }

  const debtors: Entry[] = balances
    .filter((b) => b.balanceMinor < 0)
    .map((b) => ({ id: b.memberId, amount: -b.balanceMinor }));
  const creditors: Entry[] = balances
    .filter((b) => b.balanceMinor > 0)
    .map((b) => ({ id: b.memberId, amount: b.balanceMinor }));

  const transfers: Transfer[] = [];
  while (debtors.length > 0 && creditors.length > 0) {
    debtors.sort(compare);
    creditors.sort(compare);
    const debtor = debtors[0];
    const creditor = creditors[0];
    const amount = Math.min(debtor.amount, creditor.amount);

    transfers.push({ fromMemberId: debtor.id, toMemberId: creditor.id, amountMinor: amount });
    debtor.amount -= amount;
    creditor.amount -= amount;
    if (debtor.amount === 0) debtors.shift();
    if (creditor.amount === 0) creditors.shift();
  }
  return transfers;
}