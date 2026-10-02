import { db } from "@/lib/db";
import { requireGroupMember } from "@/lib/session";
import { getGroupFinancials } from "@/lib/group-financials";
import { Badge } from "@/components/ui/badge";
import { BalanceChip } from "@/components/groups/balance-chip";
import { AddMemberForm } from "@/components/groups/add-member-form";
import { InviteLinkCard } from "@/components/groups/invite-link-card";
import { RemoveMemberButton } from "@/components/groups/remove-member-button";
import { SectionCard } from "@/components/shared/section-card";
import { UserAvatar } from "@/components/shared/user-avatar";

export default async function MembersPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const { member: me } = await requireGroupMember(groupId);

  const [group, fin] = await Promise.all([
    db.group.findUniqueOrThrow({ where: { id: groupId }, select: { inviteToken: true } }),
    getGroupFinancials(groupId),
  ]);

  const balanceById = new Map(fin.balances.map((b) => [b.memberId, b.balanceMinor]));
  const isOwner = me.role === "OWNER";
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/join/${group.inviteToken}`;

  return (
    <div className="space-y-5">
      <InviteLinkCard groupId={groupId} url={inviteUrl} canRegenerate={isOwner} />

      <SectionCard title={`Members (${fin.members.length})`}>
        <ul className="divide-y divide-border/60">
          {fin.members.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
              <UserAvatar name={m.displayName} />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{m.displayName}</span>
              {m.id === me.id && <Badge variant="secondary">You</Badge>}
              {m.role === "OWNER" && <Badge variant="secondary">Owner</Badge>}
              {m.userId === null && <Badge variant="outline">Not joined yet</Badge>}
              <BalanceChip balanceMinor={balanceById.get(m.id) ?? 0} subject="member" />
              {isOwner && m.role !== "OWNER" && (
                <RemoveMemberButton groupId={groupId} memberId={m.id} name={m.displayName} />
              )}
            </li>
          ))}
        </ul>
        <div className="mt-2 border-t border-border/60 pb-1 pt-4">
          <AddMemberForm groupId={groupId} />
        </div>
      </SectionCard>
    </div>
  );
}