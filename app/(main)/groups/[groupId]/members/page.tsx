import { db } from "@/lib/db";
import { getCurrentUser, requireGroupMember } from "@/lib/session";
import { getGroupFinancials } from "@/lib/group-financials";
import { getFriendsData } from "@/lib/friends";
import { Badge } from "@/components/ui/badge";
import { BalanceChip } from "@/components/groups/balance-chip";
import { AddMemberForm } from "@/components/groups/add-member-form";
import { InviteLinkCard } from "@/components/groups/invite-link-card";
import { RemoveMemberButton } from "@/components/groups/remove-member-button";
import { AddFromFriendsButton } from "@/components/friends/add-from-friends-button";
import { SaveFriendButton } from "@/components/friends/save-friend-button";
import { SectionCard } from "@/components/shared/section-card";
import { UserAvatar } from "@/components/shared/user-avatar";

const keyOf = (name: string) => name.trim().toLowerCase();

export default async function MembersPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const { member: me } = await requireGroupMember(groupId);

  const [group, fin, user] = await Promise.all([
    db.group.findUniqueOrThrow({ where: { id: groupId }, select: { inviteToken: true } }),
    getGroupFinancials(groupId),
    getCurrentUser(),
  ]);

  // Friends exist only for registered users. Guests: null → no friend UI, no extra query.
  const friendsData = user && !user.isAnonymous ? await getFriendsData(user.id) : null;
  const savedKeys = new Set(friendsData?.friends.map((f) => keyOf(f.name)) ?? []);

  const balanceById = new Map(fin.balances.map((b) => [b.memberId, b.balanceMinor]));
  const isOwner = me.role === "OWNER";
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/join/${group.inviteToken}`;

  return (
    <div className="space-y-5">
      <InviteLinkCard groupId={groupId} url={inviteUrl} canRegenerate={isOwner} />

      <SectionCard title={`Members (${fin.members.length})`}>
        <ul className="divide-y divide-border/60">
          {fin.members.map((m) => {
            const isMe = m.id === me.id;
            const canRemove = isOwner && m.role !== "OWNER";
            const canSaveFriend = friendsData !== null && !isMe;

            return (
              <li
                key={m.id}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1.5 py-3 sm:flex sm:flex-wrap sm:items-center sm:gap-y-1 sm:py-2.5"
              >
                <UserAvatar name={m.displayName} />

                {/* Mobile: name on the first line, badges/chip on the second line */}
                <div className="min-w-0 sm:contents">
                  <p className="break-words text-sm font-medium leading-tight sm:min-w-0 sm:flex-1 sm:truncate">
                    {m.displayName}
                  </p>

                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 sm:mt-0 sm:contents">
                    {isMe && <Badge variant="secondary">You</Badge>}
                    {m.role === "OWNER" && <Badge variant="secondary">Owner</Badge>}
                    {m.userId === null && <Badge variant="outline">Not joined yet</Badge>}
                    <BalanceChip balanceMinor={balanceById.get(m.id) ?? 0} subject="member" />
                  </div>
                </div>

                {/* Actions: one wrapper so the grid's 3rd column / the flex row stays consistent */}
                {canSaveFriend || canRemove ? (
                  <div className="flex items-center gap-1">
                    {canSaveFriend && (
                      <SaveFriendButton
                        groupId={groupId}
                        memberId={m.id}
                        name={m.displayName}
                        saved={savedKeys.has(keyOf(m.displayName))}
                      />
                    )}
                    {canRemove && (
                      <RemoveMemberButton groupId={groupId} memberId={m.id} name={m.displayName} />
                    )}
                  </div>
                ) : (
                  <span className="sm:hidden" aria-hidden />
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-2 space-y-3 border-t border-border/60 pb-1 pt-4">
          <AddMemberForm groupId={groupId} />
          {friendsData && (
            <AddFromFriendsButton
              groupId={groupId}
              friends={friendsData.friends}
              lists={friendsData.lists}
              takenNames={fin.members.map((m) => m.displayName)}
            />
          )}
        </div>
      </SectionCard>
    </div>
  );
}