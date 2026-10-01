"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { isNavActive, mainNav, personalNav, type NavItem } from "@/lib/navigation";
import type { SessionUser } from "@/lib/session";
import { useSignOut } from "@/hooks/use-sign-out";

function NavList({ items, pathname }: { items: NavItem[]; pathname: string }) {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton asChild isActive={isNavActive(item, pathname)}>
            <Link href={item.href}>
              <item.icon />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

export function AppSidebar({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();
  const isAuthed = user !== null;
  const signOut = useSignOut();
  const personalItems = personalNav.filter((i) => !i.requiresAuth || isAuthed);

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="px-4 py-5">
        <Link href="/" className="text-2xl font-semibold tracking-tight">
          dong
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <NavList items={mainNav} pathname={pathname} />
          </SidebarGroupContent>
        </SidebarGroup>

        {isAuthed && (
          <SidebarGroup>
            <SidebarGroupLabel>Personal</SidebarGroupLabel>
            <SidebarGroupContent>
              <NavList items={personalItems} pathname={pathname} />
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={signOut}>
                    <LogOut />
                    <span>Log out</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="gap-4 p-4">
        {!isAuthed && (
          <div className="rounded-xl border bg-card p-3 text-sm">
            <p className="mb-2 text-muted-foreground">
              Sign in to save your groups and access them anywhere.
            </p>
            <Button asChild size="sm" className="w-full">
              <Link href="/login">
                <LogIn /> Sign in
              </Link>
            </Button>
          </div>
        )}
        <p className="text-xs leading-snug text-muted-foreground">
          Good company.
          <br />
          Better expenses.
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}