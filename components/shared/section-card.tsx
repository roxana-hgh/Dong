import { cn } from "@/lib/utils";
import { Surface } from "./surface";

export const sectionLinkClass = "text-xs font-medium text-primary hover:underline";

export function SectionCard({
  title,
  action,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <Surface className={cn("overflow-hidden", className)}>
      <div className="flex items-center justify-between px-5 pt-4">
        <h2 className="text-sm font-semibold">{title}</h2>
        {action}
      </div>
      <div className={cn("px-5 pb-3 pt-1", bodyClassName)}>{children}</div>
    </Surface>
  );
}