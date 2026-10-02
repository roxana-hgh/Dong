import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { BalanceChip } from "@/components/groups/balance-chip";
import { UserAvatar } from "@/components/shared/user-avatar";

type Line = { name: string; amountMinor: number };

export function MemberPosition({
  name,
  isMe,
  paidMinor,
  shareMinor,
  balanceMinor,
  pays,
  gets,
}: {
  name: string;
  isMe: boolean;
  paidMinor: number;
  shareMinor: number;
  balanceMinor: number;
  pays: Line[]; // who this member must pay
  gets: Line[]; // who must pay this member
}) {
  return (
    <li className="space-y-2 py-3">
      <div className="flex items-center gap-3">
        <UserAvatar name={name} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">
            {name} {isMe && <span className="text-muted-foreground">(You)</span>}
          </p>
          <p className="text-xs text-muted-foreground">
            Paid {formatMoney(paidMinor)} · Share {formatMoney(shareMinor)}
          </p>
        </div>
        <BalanceChip balanceMinor={balanceMinor} subject="member" />
      </div>

      {(pays.length > 0 || gets.length > 0) && (
        <ul className="ml-12 space-y-1 text-sm">
          {pays.map((l) => (
            <li key={`pay-${l.name}`} className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
              <ArrowUpRight className="size-4" aria-hidden />
              Pays {l.name} <span className="font-medium tabular-nums">{formatMoney(l.amountMinor)}</span>
            </li>
          ))}
          {gets.map((l) => (
            <li key={`get-${l.name}`} className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
              <ArrowDownLeft className="size-4" aria-hidden />
              Gets <span className="font-medium tabular-nums">{formatMoney(l.amountMinor)}</span> from {l.name}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}