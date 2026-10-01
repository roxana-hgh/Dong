"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Bell, LogIn, Search, Sun } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { SessionUser } from "@/lib/session";
import { ThemeToggle } from "@/components/layouts/theme-toggle";
import { UserMenu } from "@/components/layouts/user-menu";

const routeTitles: Record<string, string> = {
    "/groups": "My Groups",
    "/groups/new": "Create Group",
    "/profile": "Profile",
    "/settings": "Settings",
};

function getGreeting(date: Date): string {
    const hour = date.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}

function getParentPath(pathname: string): string {
    const parent = pathname.split("/").slice(0, -1).join("/");
    return parent === "" ? "/" : parent;
}

function UserAvatar({ user }: { user: SessionUser }) {
    return (
        <Avatar className="size-9">
            {user.image && <AvatarImage src={user.image} alt={user.name} />}
            <AvatarFallback>{user.name.slice(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
    );
}

export function AppHeader({ user }: { user: SessionUser | null }) {
    const pathname = usePathname();
    const isDashboard = pathname === "/";

    // Computed after mount to avoid a server/client hydration mismatch.
    const [greeting, setGreeting] = useState("Hello");
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setGreeting(getGreeting(new Date()));
    }, []);

    return (
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 rounded-t-xl border-b bg-background/80 px-4 backdrop-blur md:px-6">
            <SidebarTrigger className="md:hidden" />

            {isDashboard ? (
                <div className="flex items-center gap-3">
                    <Sun className="size-6 text-amber-500" aria-hidden />
                    <div className="leading-tight">
                        <h1 className="text-sm font-semibold">
                            {greeting}, {user?.name ?? "Guest"}
                        </h1>
                        <p className="hidden text-xs text-muted-foreground sm:block">
                            Here&apos;s your groups and recent activity.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" size="icon" aria-label="Back">
                        <Link href={getParentPath(pathname)}>
                            <ArrowLeft />
                        </Link>
                    </Button>
                    <h1 className="text-base font-semibold">{routeTitles[pathname] ?? "Dong"}</h1>
                </div>
            )}

            <div className="ml-auto flex items-center gap-2">
                {isDashboard && (
                    <div className="relative hidden w-72 md:block">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search groups, people, or expenses..."
                            aria-label="Search"
                            className="rounded-full bg-muted pl-9"
                        />
                    </div>
                )}

                <ThemeToggle />

                {user && (
                    <Button variant="ghost" size="icon" aria-label="Notifications">
                        <Bell />
                    </Button>
                )}

                <UserMenu user={user} />
            </div>
        </header>
    );
}