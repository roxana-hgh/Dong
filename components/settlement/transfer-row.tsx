import { formatMoney } from "@/lib/money";
import { UserAvatar } from "@/components/shared/user-avatar";
import { cn } from "@/lib/utils";

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
  const iPay = from.id === meId;
  const iGet = to.id === meId;
  const title = `${iPay ? "You" : from.displayName} → ${iGet ? "You" : to.displayName}`;
  const subtitle = iPay ? "You pay" : iGet ? "Pays you" : "Pending";

  return (
    <li className="flex items-center gap-3 py-2.5">
      <div className="flex shrink-0 -space-x-2">
        <UserAvatar name={from.displayName} size="sm" className="ring-2 ring-card" />
        <UserAvatar name={to.displayName} size="sm" className="ring-2 ring-card" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <span
        className={cn(
          "text-sm font-semibold tabular-nums",
          iGet && "text-emerald-700 dark:text-emerald-300",
          iPay && "text-amber-800 dark:text-amber-300",
        )}
      >
        {formatMoney(amountMinor)}
      </span>
      {action}
    </li>
  );
}