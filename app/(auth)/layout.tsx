import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { AuthScenery } from "@/components/auth/auth-scenery";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-svh lg:grid-cols-5">
      <AuthBrandPanel className="hidden lg:col-span-2 lg:flex" />

      <div className="flex min-h-dvh flex-col bg-background lg:col-span-3">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8 lg:justify-center">
          {children}
        </div>
   
        <AuthScenery className="h-32 lg:hidden" />
      </div>
    </main>
  );
}