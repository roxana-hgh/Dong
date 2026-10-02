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
    <nav aria-label="Group sections" className="flex gap-1 border-b">
      {TABS.map((tab) => {
        const active = tab.href === "" ? pathname === base : pathname.startsWith(base + tab.href);
        return (
          <Link
            key={tab.label}
            href={base + tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}