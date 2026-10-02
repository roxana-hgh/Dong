import { cn } from "@/lib/utils";

/** The one card look: no hard border, soft ring + layered shadow. */
export function Surface({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-card shadow-[0_1px_2px_rgb(15_23_42/0.04),0_4px_16px_-8px_rgb(15_23_42/0.08)] ring-1 ring-border/60",
        className,
      )}
      {...props}
    />
  );
}