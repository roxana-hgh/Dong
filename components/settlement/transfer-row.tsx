import { ArrowRight } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { UserAvatar } from "@/components/shared/user-avatar";

type Person = { id: string; displayName: string };

export function TransferRow({
  from,
  to,
  amountMinor,
  meId,
  action,
}: {
  from: Person;
  to: Person;
  amountMinor: number;
  meId: string;
  action?: React.ReactNode;
}) {
  const fromLabel = from.id === meId ? "You" : from.displayName;
  const toLabel = to.id === meId ? "you" : to.displayName;
  const verb = from.id === meId ? "pay" : "pays";

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex shrink-0 items-center gap-1.5">
        <UserAvatar name={from.displayName} />
        <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
        <UserAvatar name={to.displayName} />
      </div>
      <p className="min-w-0 flex-1 truncate text-sm font-medium">
        {fromLabel} {verb} {toLabel}
      </p>
      <span className="font-semibold tabular-nums">{formatMoney(amountMinor)}</span>
      {action}
    </div>
  );
}