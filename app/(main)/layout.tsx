
import { AppHeader } from "@/components/layouts/app-header";
import { AppSidebar } from "@/components/layouts/app-sidebar";
import { MobileNav } from "@/components/layouts/mobile-nav";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getSessionUser } from "@/lib/session";


export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <AppHeader user={user} />
        <main className="flex-1 p-4 pb-24 md:p-6 md:pb-6">{children}</main>
      </SidebarInset>
      <MobileNav user={user} />
    </SidebarProvider>
  );
}