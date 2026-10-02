import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireGroupMember } from "@/lib/session";
import { GroupHeader } from "@/components/groups/group-header";
import { GroupTabs } from "@/components/groups/group-tabs";

export default async function GroupLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  await requireGroupMember(groupId);

  const group = await db.group.findUnique({
    where: { id: groupId },
    select: { id: true, name: true, _count: { select: { members: true } } },
  });
  if (!group) notFound();

  return (
    <div className="space-y-6">
      <GroupHeader id={group.id} name={group.name} memberCount={group._count.members} />
      <GroupTabs groupId={groupId} />
      {children}
    </div>
  );
}