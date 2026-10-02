import { db } from "@/lib/db";
import { requireGroupMember } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddMemberForm } from "@/components/groups/add-member-form";
import { InviteLinkCard } from "@/components/groups/invite-link-card";
import { RemoveMemberButton } from "@/components/groups/remove-member-button";
import { getGroupFinancials } from "@/lib/group-financials";
import { UserAvatar } from "@/components/shared/user-avatar";
import { BalanceChip } from "@/components/groups/balance-chip";

export default async function MembersPage({ params }: { params: Promise<{ groupId: string }> }) {
    const { groupId } = await params;
    const { member: me } = await requireGroupMember(groupId);

    const group = await db.group.findUniqueOrThrow({
        where: { id: groupId },
        select: {
            inviteToken: true,
            members: {
                orderBy: { joinedAt: "asc" },
                select: { id: true, displayName: true, role: true, userId: true },
            },
        },
    });

    const isOwner = me.role === "OWNER";
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/join/${group.inviteToken}`;

    const { balances } = await getGroupFinancials(groupId);
    const balanceById = new Map(balances.map((b) => [b.memberId, b.balanceMinor]));

    return (
        <div className="space-y-6">
            <InviteLinkCard groupId={groupId} url={inviteUrl} canRegenerate={isOwner} />

            <Card className="rounded-2xl">
                <CardHeader><CardTitle>Members</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <ul className="divide-y">
                        {group.members.map((m) => (
                            <li key={m.id} className="flex items-center gap-3 py-3">
                                <UserAvatar name={m.displayName} />
                                <span className="flex-1 font-medium">{m.displayName}</span>
                                {m.id === me.id && <Badge>You</Badge>}
                                {m.role === "OWNER" && <Badge variant="secondary">Owner</Badge>}
                                {m.userId === null && <Badge variant="outline">Not joined yet</Badge>}
                                <BalanceChip balanceMinor={balanceById.get(m.id) ?? 0} subject="member" />
                                {isOwner && m.role !== "OWNER" && (
                                    <RemoveMemberButton groupId={groupId} memberId={m.id} name={m.displayName} />
                                )}
                            </li>
                        ))}
                    </ul>
                    <AddMemberForm groupId={groupId} />
                </CardContent>
            </Card>
        </div>
    );
}