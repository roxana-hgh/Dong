"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn } from "lucide-react";

import { isNavActive, mobileNav, type NavItem } from "@/lib/navigation";
import type { SessionUser } from "@/lib/session";
import { cn } from "@/lib/utils";

const signInItem: NavItem = { title: "Sign in", href: "/login", icon: LogIn };

export function MobileNav({ user }: { user: SessionUser | null }) {
    const pathname = usePathname();

    // Guests can't open Profile, so we swap it for a Sign in shortcut.
    const items = mobileNav.map((item) =>
        item.requiresAuth && !user ? signInItem : item,
    );

    return (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-20 flex h-dvh items-end px-6 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
            <nav
                aria-label="Primary"
                className="pointer-events-auto mx-auto flex h-14 w-full max-w-xs items-center justify-between rounded-full border border-white/30 bg-background/60 px-2 shadow-lg shadow-black/10 backdrop-blur-xl backdrop-saturate-150 dark:border-white/10"
            >
                {items.map((item) => {
                    const active = isNavActive(item, pathname);

                    if (item.highlight) {
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-label={item.title}
                                aria-current={active ? "page" : undefined}
                                className="flex size-9 -translate-y-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 ring-4 ring-background/50 transition active:scale-90"
                            >
                                <item.icon className="size-5" />
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-label={item.title}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                                "relative flex size-11 items-center justify-center rounded-full transition active:scale-90",
                                active ? "text-foreground" : "text-muted-foreground",
                            )}
                        >
                            <item.icon className="size-5" strokeWidth={active ? 1.75 : 1.5} />
                            {active && (
                                <span className="absolute bottom-1 size-1 rounded-full bg-foreground" />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );

}