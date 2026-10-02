import { stableHash } from "@/lib/hash";
import { cn } from "@/lib/utils";

// Navy primary fading into a different accent per group. Full class strings so Tailwind keeps them.
const VARIANTS = [
  "from-primary via-primary/85 to-sky-400/70",
  "from-primary via-indigo-700/80 to-sky-300/70",
  "from-primary via-teal-700/70 to-emerald-300/60",
  "from-primary via-violet-700/70 to-sky-300/60",
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
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br",
        VARIANTS[stableHash(seed) % VARIANTS.length],
        className,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute -right-6 -top-10 size-36 rounded-full bg-white/20 blur-2xl" />
      <svg
        aria-hidden
        viewBox="0 0 400 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 w-full fill-white/10"
      >
        <path d="M0 100V62l60-34 55 40 70-52 80 58 55-30 80 40v36z" />
      </svg>
      {children}
    </div>
  );
}