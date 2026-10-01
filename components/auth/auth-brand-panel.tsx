import Link from "next/link";
import { CreditCard, Users, Zap } from "lucide-react";

import { AuthScenery } from "@/components/auth/auth-scenery";
import { cn } from "@/lib/utils";

const features = [
  { icon: Users, title: "Create groups", description: "Travel, home, events and more." },
  { icon: CreditCard, title: "Track expenses", description: "Add, split and see who owes what." },
  { icon: Zap, title: "Settle up", description: "Fewer transactions, less hassle." },
];

export function AuthBrandPanel({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "relative flex-col overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-background p-10",
        className,
      )}
    >
      <Link href="/" className="text-3xl font-semibold tracking-tight text-primary">
        dong
      </Link>

      <div className="mt-16">
        <h2 className="text-3xl font-semibold leading-tight">
          Good company.
          <br />
          Better expenses.
        </h2>
        <p className="mt-4 max-w-xs text-muted-foreground">
          Split costs, settle easily, and keep your group in sync.
        </p>
      </div>

      <ul className="mt-10 space-y-6">
        {features.map(({ icon: Icon, title, description }) => (
          <li key={title} className="flex items-start gap-4">
            <Icon className="mt-0.5 size-6 text-primary" aria-hidden />
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </li>
        ))}
      </ul>

      <AuthScenery className="absolute inset-x-0 bottom-0 h-1/3" />
    </aside>
  );
}