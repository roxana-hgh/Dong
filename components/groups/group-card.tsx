import Link from "next/link";
import { Users } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { Surface } from "@/components/shared/surface";
import { BalanceChip } from "./balance-chip";
import { GroupCover } from "./group-cover";
import { StatusPill } from "./status-pill";

export type GroupCardData = {
  id: string;
  name: string;
  memberCount: number;
  totalMinor: number;
  balanceMinor: number;
};

export function GroupCard({ group }: { group: GroupCardData }) {
  return (
    <Link
      href={`/groups/${group.id}`}
      className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Surface className="overflow-hidden transition duration-200 motion-safe:group-hover:-translate-y-0.5 group-hover:shadow-lg">
        <GroupCover seed={group.id} className="w-full aspect-2/1">
          <StatusPill className="absolute right-2.5 top-2.5" />
        </GroupCover>
        <div className="space-y-2.5 p-3.5">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold leading-tight">{group.name}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="size-3" aria-hidden />
              {group.memberCount} members · USD
            </p>
          </div>
          <p className="text-xl font-semibold tabular-nums tracking-tight">{formatMoney(group.totalMinor)}</p>
          <BalanceChip balanceMinor={group.balanceMinor} />
        </div>
      </Surface>
    </Link>
  );
}