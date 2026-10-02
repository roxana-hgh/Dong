import { stableHash } from "@/lib/hash";
import { cn } from "@/lib/utils";

const VARIANTS = [
  "bg-gradient-to-br from-primary to-primary/40",
  "bg-gradient-to-tr from-primary/90 to-primary/30",
  "bg-gradient-to-bl from-primary to-primary/50",
  "bg-gradient-to-r from-primary/90 via-primary/60 to-primary/30",
];

export function GroupCover({
  seed,
  className,
  children,
}: {
  seed: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("relative overflow-hidden", VARIANTS[stableHash(seed) % VARIANTS.length], className)}>
      <div aria-hidden className="pointer-events-none absolute -right-8 -top-10 size-40 rounded-full bg-primary-foreground/10" />
      <div aria-hidden className="pointer-events-none absolute -bottom-12 left-1/3 size-32 rounded-full bg-primary-foreground/10" />
      {children}
    </div>
  );
}