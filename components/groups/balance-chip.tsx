import { CheckCircle2, TrendingDown, TrendingUp } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

const TONES = {
  owed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  owe: "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
  settled: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
};

/** Text + icon + color: never color alone. `subject="you"` for the current user, `"member"` for others. */
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
  const base = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap";

  if (balanceMinor === 0) {
    return (
      <span className={cn(base, TONES.settled, className)}>
        <CheckCircle2 className="size-3.5" aria-hidden />
        {subject === "you" ? "You're settled up" : "Settled up"}
      </span>
    );
  }
  if (balanceMinor > 0) {
    return (
      <span className={cn(base, TONES.owed, className)}>
        <TrendingUp className="size-3.5" aria-hidden />
        {subject === "you" ? `You're owed ${amount}` : `Gets ${amount}`}
      </span>
    );
  }
  return (
    <span className={cn(base, TONES.owe, className)}>
      <TrendingDown className="size-3.5" aria-hidden />
      {subject === "you" ? `You owe ${amount}` : `Owes ${amount}`}
    </span>
  );
}