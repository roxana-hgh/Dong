import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionCard, sectionLinkClass } from "@/components/shared/section-card";
import { UserAvatar } from "@/components/shared/user-avatar";
import { BalanceLine } from "./balance-chip";

export function MembersCard({
  groupId,
  members,
  balanceById,
  meId,
  className,
}: {
  groupId: string;
  members: { id: string; displayName: string }[];
  balanceById: Map<string, number>;
  meId: string;
  className?: string;
}) {
  return (
    <SectionCard
      title="Group members"
      className={className}
      action={
        <Link href={`/groups/${groupId}/members`} className={sectionLinkClass}>
          Manage
        </Link>
      }
    >
      <ul className="divide-y divide-border/60">
        {members.map((m) => (
          <li key={m.id} className="flex items-center gap-3 py-2.5">
            <UserAvatar name={m.displayName} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {m.displayName} {m.id === meId && <span className="font-normal text-muted-foreground">(You)</span>}
              </p>
              <p className="text-xs">
                <BalanceLine balanceMinor={balanceById.get(m.id) ?? 0} isMe={m.id === meId} />
              </p>
            </div>
          </li>
        ))}
      </ul>
      <Button asChild className="mb-1 mt-3 w-full">
        <Link href={`/groups/${groupId}/expenses/new`}>
          <Plus className="size-4" aria-hidden /> Add expense
        </Link>
      </Button>
    </SectionCard>
  );
}