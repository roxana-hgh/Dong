import {
  Activity,
  Home,
  Plus,
  Settings,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  requiresAuth?: boolean;
  exact?: boolean;
  excludes?: string[];
  highlight?: boolean;
};

export const mainNav: NavItem[] = [
  { title: "Home", href: "/", icon: Home, exact: true },
  { title: "My Groups", href: "/groups", icon: Users, excludes: ["/groups/new"] },
  { title: "Create Group", href: "/groups/new", icon: Plus, exact: true },
];

export const personalNav: NavItem[] = [
  { title: "Profile", href: "/profile", icon: User, requiresAuth: true },
  { title: "Settings", href: "/settings", icon: Settings, requiresAuth: true },
];

export function isNavActive(item: NavItem, pathname: string): boolean {
  if (item.exact) return pathname === item.href;
  if (item.excludes?.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return false;
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}


export const mobileNav: NavItem[] = [
  { title: "Home", href: "/", icon: Home, exact: true },
  { title: "Groups", href: "/groups", icon: Users, excludes: ["/groups/new"] },
  { title: "Create", href: "/groups/new", icon: Plus, exact: true, highlight: true },
  { title: "Activity", href: "/activity", icon: Activity },
  { title: "Profile", href: "/profile", icon: User, requiresAuth: true },
];