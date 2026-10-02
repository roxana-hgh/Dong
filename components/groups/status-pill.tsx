import { cn } from "@/lib/utils";

export function StatusPill({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-emerald-700 backdrop-blur dark:bg-emerald-950/80 dark:text-emerald-300",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
      Active
    </span>
  );
}