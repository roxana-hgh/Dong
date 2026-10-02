import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { Card, CardContent } from "@/components/ui/card";
import { JoinForm } from "@/components/groups/join-form";

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const group = await db.group.findUnique({
    where: { inviteToken: token },
    select: {
      id: true,
      name: true,
      status: true,
      members: { select: { id: true, displayName: true, userId: true } },
    },
  });

  if (!group || group.status !== "ACTIVE") {
    return (
      <main className="mx-auto max-w-md p-6">
        <Card className="rounded-2xl"><CardContent className="py-10 text-center">This invite link is invalid or expired.</CardContent></Card>
      </main>
    );
  }

  const user = await getCurrentUser();
  if (user && group.members.some((m) => m.userId === user.id)) redirect(`/groups/${group.id}`);

  const claimable = group.members.filter((m) => m.userId === null).map((m) => ({ id: m.id, displayName: m.displayName }));

  return (
    <main className="mx-auto max-w-md p-6">
      <JoinForm token={token} groupName={group.name} memberCount={group.members.length} claimable={claimable} />
    </main>
  );
}