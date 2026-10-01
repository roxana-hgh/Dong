import { cn } from "@/lib/utils";

// Simple layered mountains + water. Uses currentColor, so it follows the theme
export function AuthScenery({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 160"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden
      className={cn("w-full text-primary", className)}
    >
      <path d="M0 110 L90 50 L150 90 L230 30 L320 95 L400 60 V160 H0Z" fill="currentColor" opacity="0.08" />
      <path d="M0 130 L70 85 L140 115 L220 70 L300 120 L400 90 V160 H0Z" fill="currentColor" opacity="0.14" />
      <path d="M0 145 Q100 130 200 145 T400 140 V160 H0Z" fill="currentColor" opacity="0.2" />
    </svg>
  );
}