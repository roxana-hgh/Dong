import { CheckCircle2, TrendingDown, TrendingUp } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

const TONES = {
  owed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  owe: "bg-amber-500/10 text-amber-800 dark:text-amber-300",
  settled: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

/** Text + icon + color: never color alone. */
export function BalanceChip({
  balanceMinor,
  subject = "you",
  className,
}: {
  balanceMinor: number;
  subject?: "you" | "member";
  className?: string;
}) {
  const amount = formatMoney(Math.abs(balanceMinor));
  const base = "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap";

  if (balanceMinor === 0) {
    return (
      <span className={cn(base, TONES.settled, className)}>
        <CheckCircle2 className="size-3" aria-hidden />
        {subject === "you" ? "You're settled up" : "Settled up"}
      </span>
    );
  }
  if (balanceMinor > 0) {
    return (
      <span className={cn(base, TONES.owed, className)}>
        <TrendingUp className="size-3" aria-hidden />
        {subject === "you" ? `You're owed ${amount}` : `Gets ${amount}`}
      </span>
    );
  }
  return (
    <span className={cn(base, TONES.owe, className)}>
      <TrendingDown className="size-3" aria-hidden />
      {subject === "you" ? `You owe ${amount}` : `Owes ${amount}`}
    </span>
  );
}

/** Plain-text variant for dense lists ("Owes $22"). */
export function BalanceLine({ balanceMinor, isMe }: { balanceMinor: number; isMe: boolean }) {
  if (balanceMinor === 0) return <span className="text-muted-foreground">Settled up</span>;
  if (balanceMinor > 0) {
    return (
      <span className="text-emerald-700 dark:text-emerald-300">
        {isMe ? "You're owed" : "Gets"} {formatMoney(balanceMinor)}
      </span>
    );
  }
  return (
    <span className="text-amber-800 dark:text-amber-300">
      {isMe ? "You owe" : "Owes"} {formatMoney(-balanceMinor)}
    </span>
  );
}