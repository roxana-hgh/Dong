import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TONES = {
  default: "",
  owe: "text-amber-700 dark:text-amber-300",
  owed: "text-emerald-700 dark:text-emerald-300",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  className,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  return (
    <Card className={cn("gap-1 rounded-2xl py-4", className)}>
      <CardContent className="space-y-1 px-5">
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {Icon && <Icon className="size-4" aria-hidden />}
          {label}
        </p>
        <p className={cn("text-2xl font-semibold tabular-nums", TONES[tone])}>{value}</p>
      </CardContent>
    </Card>
  );
}