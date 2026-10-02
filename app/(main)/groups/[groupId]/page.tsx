import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDownLeft, ArrowUpRight, Plus, Receipt, Wallet } from "lucide-react";
import { db } from "@/lib/db";
import { requireGroupMember } from "@/lib/session";
import { getGroupFinancials } from "@/lib/group-financials";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { BalanceChip } from "@/components/groups/balance-chip";
import { UserAvatar } from "@/components/shared/user-avatar";
import { ExpenseList } from "@/components/expenses/expense-list";
import { TransferRow } from "@/components/settlement/transfer-row";

export default async function GroupOverviewPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const { member } = await requireGroupMember(groupId);

  const [fin, recent] = await Promise.all([
    getGroupFinancials(groupId),
    db.expense.findMany({
      where: { groupId },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 5,
      select: {
        id: true, title: true, amountMinor: true, category: true, date: true, createdById: true,
        paidBy: { select: { displayName: true } },
      },
    }),
  ]);

  const mine = fin.balances.find((b) => b.memberId === member.id);
  if (!mine) notFound();

  const memberById = new Map(fin.members.map((m) => [m.id, m]));
  const balanceById = new Map(fin.balances.map((b) => [b.memberId, b]));
  const youOwe = fin.transfers.filter((t) => t.fromMemberId === member.id).reduce((s, t) => s + t.amountMinor, 0);
  const youAreOwed = fin.transfers.filter((t) => t.toMemberId === member.id).reduce((s, t) => s + t.amountMinor, 0);
  const preview = fin.transfers.slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total spending" value={formatMoney(fin.totalMinor)} icon={Wallet} className="col-span-2 lg:col-span-1" />
        <StatCard label="You paid" value={formatMoney(mine.paidMinor)} icon={Receipt} />
        <StatCard label="Your share" value={formatMoney(mine.shareMinor)} />
        <StatCard label="You owe" value={formatMoney(youOwe)} icon={ArrowUpRight} tone={youOwe > 0 ? "owe" : "default"} />
        <StatCard label="You are owed" value={formatMoney(youAreOwed)} icon={ArrowDownLeft} tone={youAreOwed > 0 ? "owed" : "default"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="rounded-2xl">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Who owes whom</CardTitle>
              <Link href={`/groups/${groupId}/settlement`} className="text-sm text-primary hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {preview.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">Everyone is settled up. 🎉</p>
              ) : (
                <div className="divide-y">
                  {preview.map((t) => {
                    const from = memberById.get(t.fromMemberId);
                    const to = memberById.get(t.toMemberId);
                    if (!from || !to) return null;
                    return (
                      <TransferRow
                        key={`${t.fromMemberId}-${t.toMemberId}`}
                        from={from}
                        to={to}
                        amountMinor={t.amountMinor}
                        meId={member.id}
                      />
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent expenses</h2>
              <Button asChild>
                <Link href={`/groups/${groupId}/expenses/new`}>
                  <Plus className="size-4" aria-hidden /> Add expense
                </Link>
              </Button>
            </div>
            <ExpenseList expenses={recent} groupId={groupId} currentMember={member} />
          </div>
        </div>

        <Card className="h-fit rounded-2xl">
          <CardHeader>
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {fin.members.map((m) => (
                <li key={m.id} className="flex items-center gap-3 py-3">
                  <UserAvatar name={m.displayName} />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {m.displayName} {m.id === member.id && <span className="text-muted-foreground">(You)</span>}
                  </span>
                  <BalanceChip balanceMinor={balanceById.get(m.id)?.balanceMinor ?? 0} subject="member" />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}