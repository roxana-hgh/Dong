import type { LucideIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type IconInputProps = React.ComponentProps<"input"> & { icon: LucideIcon };

// With React 19, `ref` is a normal prop, so react-hook-form's register() works as-is
export function IconInput({ icon: Icon, className, ...props }: IconInputProps) {
  return (
    <div className="relative">
      <Icon
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input className={cn("h-11 rounded-lg pl-10", className)} {...props} />
    </div>
  );
}