import Link from "next/link";
import { Users } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { BalanceChip } from "./balance-chip";
import { GroupCover } from "./group-cover";

export type GroupCardData = {
  id: string;
  name: string;
  memberCount: number;
  totalMinor: number;
  balanceMinor: number;
};

export function GroupCard({ group }: { group: GroupCardData }) {
  return (
    <Link href={`/groups/${group.id}`} className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
      <Card className="gap-0 overflow-hidden rounded-2xl py-0 transition-shadow hover:shadow-md">
        <GroupCover seed={group.id} className="w-full aspect-2/1">
          <Badge className="absolute left-3 top-3 bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20">
            Active
          </Badge>
        </GroupCover>
        <div className="space-y-2 p-3 rounded-lg -translate-y-1">
          <div>
            <p className="truncate text-base font-semibold">{group.name}</p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="size-3.5" aria-hidden />
              {group.memberCount} members · USD
            </p>
          </div>
          <p className="text-lg font-semibold tabular-nums">{formatMoney(group.totalMinor)}</p>
          <BalanceChip balanceMinor={group.balanceMinor} />
        </div>
      </Card>
    </Link>
  );
}