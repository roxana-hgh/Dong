"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Overview", href: "" },
  { label: "Expenses", href: "/expenses" },
  { label: "Members", href: "/members" },
  { label: "Settlement", href: "/settlement" },
];

export function GroupTabs({ groupId }: { groupId: string }) {
  const pathname = usePathname();
  const base = `/groups/${groupId}`;

  return (
    <nav aria-label="Group sections" className="flex gap-1 overflow-x-auto px-3 [scrollbar-width:none] sm:px-4">
      {TABS.map((tab) => {
        const active = tab.href === "" ? pathname === base : pathname.startsWith(base + tab.href);
        return (
          <Link
            key={tab.label}
            href={base + tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative whitespace-nowrap px-3 py-3 text-[13px] font-medium transition-colors",
              active
                ? "text-primary after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}