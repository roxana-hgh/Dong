import { CheckCircle2 } from "lucide-react";
import { requireGroupMember } from "@/lib/session";
import { getGroupFinancials } from "@/lib/group-financials";
import { formatMoney } from "@/lib/money";
import { SectionCard } from "@/components/shared/section-card";
import { UserAvatar } from "@/components/shared/user-avatar";
import { MarkPaidButton } from "@/components/settlement/mark-paid-button";
import { MemberPosition } from "@/components/settlement/member-position";
import { ShareSettlementButton } from "@/components/settlement/share-settlement-button";
import { TransferRow } from "@/components/settlement/transfer-row";
import { UndoSettlementButton } from "@/components/settlement/undo-settlement-button";

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

export default async function SettlementPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const { member: me } = await requireGroupMember(groupId);
  const { members, balances, transfers, settlements } = await getGroupFinancials(groupId);

  const memberById = new Map(members.map((m) => [m.id, m]));
  const nameOf = (id: string) => memberById.get(id)?.displayName ?? "Unknown";
  const isOwner = me.role === "OWNER";

  const shareLines = transfers.map(
    (t) => `${nameOf(t.fromMemberId)} → ${nameOf(t.toMemberId)}: ${formatMoney(t.amountMinor)}`,
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {transfers.length === 0
            ? "You're all settled up! Nobody owes anything right now."
            : "Here are the payments needed to settle the group."}
        </p>
        <ShareSettlementButton title="Settlement" lines={shareLines} />
      </div>

      {transfers.length > 0 && (
        <SectionCard title="Payments needed">
          <ul className="divide-y divide-border/60">
            {transfers.map((t) => {
              const from = memberById.get(t.fromMemberId);
              const to = memberById.get(t.toMemberId);
              if (!from || !to) return null;
              const canMark = isOwner || me.id === t.fromMemberId || me.id === t.toMemberId;
              return (
                <TransferRow
                  key={`${t.fromMemberId}-${t.toMemberId}`}
                  from={from}
                  to={to}
                  amountMinor={t.amountMinor}
                  meId={me.id}
                  action={
                    canMark ? (
                      <MarkPaidButton
                        groupId={groupId}
                        fromMemberId={t.fromMemberId}
                        toMemberId={t.toMemberId}
                        amountMinor={t.amountMinor}
                      />
                    ) : null
                  }
                />
              );
            })}
          </ul>
        </SectionCard>
      )}

      <SectionCard title="Everyone's position">
        <ul className="divide-y divide-border/60">
          {balances.map((b) => (
            <MemberPosition
              key={b.memberId}
              name={nameOf(b.memberId)}
              isMe={b.memberId === me.id}
              paidMinor={b.paidMinor}
              shareMinor={b.shareMinor}
              balanceMinor={b.balanceMinor}
              pays={transfers
                .filter((t) => t.fromMemberId === b.memberId)
                .map((t) => ({ name: nameOf(t.toMemberId), amountMinor: t.amountMinor }))}
              gets={transfers
                .filter((t) => t.toMemberId === b.memberId)
                .map((t) => ({ name: nameOf(t.fromMemberId), amountMinor: t.amountMinor }))}
            />
          ))}
        </ul>
      </SectionCard>

      {settlements.length > 0 && (
        <SectionCard title="All settled up">
          <ul className="divide-y divide-border/60">
            {settlements.map((s) => {
              const canUndo = isOwner || s.markedById === me.id;
              return (
                <li key={s.id} className="flex items-center gap-3 py-2.5">
                  <UserAvatar name={nameOf(s.fromMemberId)} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">
                      {nameOf(s.fromMemberId)} → {nameOf(s.toMemberId)}
                    </p>
                    <p className="text-xs text-muted-foreground">{dateFormat.format(s.paidAt)}</p>
                  </div>
                  <span className="text-sm font-medium tabular-nums">{formatMoney(s.amountMinor)}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="size-3" aria-hidden /> Paid
                  </span>
                  {canUndo && <UndoSettlementButton groupId={groupId} settlementId={s.id} />}
                </li>
              );
            })}
          </ul>
        </SectionCard>
      )}
    </div>
  );
}