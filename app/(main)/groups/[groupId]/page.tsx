import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDownLeft, ArrowUpRight, Receipt, Wallet, Coins } from "lucide-react";
import { db } from "@/lib/db";
import { requireGroupMember } from "@/lib/session";
import { getGroupFinancials } from "@/lib/group-financials";
import { formatMoney } from "@/lib/money";
import { StatCard } from "@/components/dashboard/stat-card";
import { MembersCard } from "@/components/groups/members-card";
import { SectionCard, sectionLinkClass } from "@/components/shared/section-card";
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
        _count: { select: { shares: true } },
      },
    }),
  ]);

  const mine = fin.balances.find((b) => b.memberId === member.id);
  if (!mine) notFound();

  const memberById = new Map(fin.members.map((m) => [m.id, m]));
  const balanceById = new Map(fin.balances.map((b) => [b.memberId, b.balanceMinor]));
  const youOwe = fin.transfers.filter((t) => t.fromMemberId === member.id).reduce((s, t) => s + t.amountMinor, 0);
  const youAreOwed = fin.transfers.filter((t) => t.toMemberId === member.id).reduce((s, t) => s + t.amountMinor, 0);
  const preview = fin.transfers.slice(0, 4);

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
          <StatCard label="Total spending" value={formatMoney(fin.totalMinor)} icon={Wallet} className="col-span-2" />
          <StatCard label="You paid" value={formatMoney(mine.paidMinor)} icon={Receipt} className="sm:col-span-2" />
          <StatCard label="Your share" value={formatMoney(mine.shareMinor)} icon={Coins} className="sm:col-span-2" />
          <StatCard label="You owe" value={formatMoney(youOwe)} icon={ArrowUpRight} tone={youOwe > 0 ? "owe" : "default"} className="sm:col-span-3" />
          <StatCard label="You are owed" value={formatMoney(youAreOwed)} icon={ArrowDownLeft} tone={youAreOwed > 0 ? "owed" : "default"} className="sm:col-span-3" />
        </div>

        <SectionCard
          title="Who owes whom"
          action={<Link href={`/groups/${groupId}/settlement`} className={sectionLinkClass}>View all</Link>}
        >
          {preview.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Everyone is settled up 🎉</p>
          ) : (
            <ul className="divide-y divide-border/60">
              {preview.map((t) => {
                const from = memberById.get(t.fromMemberId);
                const to = memberById.get(t.toMemberId);
                if (!from || !to) return null;
                return (
                  <TransferRow key={`${t.fromMemberId}-${t.toMemberId}`} from={from} to={to} amountMinor={t.amountMinor} meId={member.id} />
                );
              })}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Recent expenses"
          action={<Link href={`/groups/${groupId}/expenses`} className={sectionLinkClass}>View all</Link>}
        >
          <ExpenseList expenses={recent} groupId={groupId} currentMember={member} />
        </SectionCard>
      </div>

      <MembersCard
        groupId={groupId}
        members={fin.members}
        balanceById={balanceById}
        meId={member.id}
        className="h-fit"
      />
    </div>
  );
}