import type { LucideIcon } from "lucide-react";
import { Surface } from "@/components/shared/surface";
import { cn } from "@/lib/utils";

const VALUE_TONES = {
  default: "",
  owe: "text-amber-800 dark:text-amber-300",
  owed: "text-emerald-700 dark:text-emerald-300",
};
const ICON_TONES = {
  default: "bg-primary/10 text-primary",
  owe: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  owed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
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
  tone?: keyof typeof VALUE_TONES;
  className?: string;
}) {
  return (
    <Surface className={cn("flex items-center justify-between gap-3 px-4 py-3", className)}>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("mt-0.5 truncate text-xl font-semibold tabular-nums tracking-tight", VALUE_TONES[tone])}>
          {value}
        </p>
      </div>
      {Icon && (
        <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl", ICON_TONES[tone])}>
          <Icon className="size-4" aria-hidden />
        </span>
      )}
    </Surface>
  );
}