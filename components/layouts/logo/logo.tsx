import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "select-none text-3xl font-extrabold lowercase tracking-tight text-primary",
        className,
      )}
    >
      dong
    </span>
  );
}